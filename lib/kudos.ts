// Kudo 모듈: 유스케이스와 SQL을 함께 가진다(ADR 0001). 서버 코드에서만 import한다.
import { z } from "zod";
import { getSql } from "@/lib/db";
import { HttpError } from "@/lib/http";
import {
  CATEGORIES,
  EMOJIS,
  KUDO_GONE_MESSAGE,
  SORTS,
  createKudoSchema,
  totalReactions,
  deleteKudoSchema,
  nameSchema,
  updateKudoSchema,
  type Category,
  type BoardStats,
  type TopColleague,
  type Emoji,
  type KudoPage,
  type KudoView,
  type ReactionResult,
  type Reactions,
  type ReactionState,
} from "@/lib/kudo-schema";
import { hashPassword, verifyPassword } from "@/lib/password";
import { consumeRateLimit } from "@/lib/rate-limit";
import { boardTemperature, colleagueTemperature, kudoTemperature } from "@/lib/temperature";

const PAGE_SIZE = 20;
const MAX_ID = 2_147_483_647; // integer 컬럼의 최댓값

/** "123" 같은 id 문자열인지. integer 범위를 넘으면 DB 오류가 나므로 여기서 걸러낸다. */
const isId = (v: string) => /^\d+$/.test(v) && Number(v) <= MAX_ID;

type KudoRow = {
  id: number;
  author: string;
  recipient: string | null;
  category: Category;
  message: string;
  created_at: string | Date;
  updated_at: string | Date | null;
  reactions?: Partial<Record<Emoji, ReactionState>> | null;
};

const iso = (v: string | Date) => new Date(v).toISOString();

function toView(row: KudoRow): KudoView {
  const reactions = Object.fromEntries(
    EMOJIS.map((e) => [e, row.reactions?.[e] ?? { count: 0, reacted: false }]),
  ) as Reactions;
  return {
    id: row.id,
    author: row.author,
    recipient: row.recipient,
    category: row.category,
    message: row.message,
    createdAt: iso(row.created_at),
    editedAt: row.updated_at ? iso(row.updated_at) : null,
    reactions,
    temperature: kudoTemperature(totalReactions(reactions)),
  };
}

const listQuerySchema = z.object({
  cursor: z.string().refine(isId, "잘못된 커서예요").optional(),
  category: z.enum(CATEGORIES, { error: "알 수 없는 카테고리예요" }).optional(),
  q: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || undefined),
  sort: z.enum(SORTS, { error: "알 수 없는 정렬이에요" }).default("latest"),
  to: nameSchema("받는 사람")
    .optional()
    .transform((v) => v || undefined),
});

export type ListQuery = z.input<typeof listQuerySchema>;

/** Kudo 한 행과, Visitor 기준 reacted가 담긴 이모지별 Reaction 집계. `kudos k`에 붙여 쓴다. */
function kudoColumns(visitorId: string | null) {
  const sql = getSql();
  return sql`k.id, k.author, k.recipient, k.category, k.message, k.created_at, k.updated_at,
    (select json_object_agg(emoji, json_build_object('count', n, 'reacted', mine))
     from (select emoji, count(*)::int as n, coalesce(bool_or(visitor_id = ${visitorId}::uuid), false) as mine
           from reactions r where r.kudo_id = k.id group by emoji) x) as reactions`;
}

/** 한 Kudo에 달린 리액션 수. `kudos k`에 붙여 쓴다. */
const reactionTotal = () => getSql()`(select count(*) from reactions r where r.kudo_id = k.id)`;

/** Kudo 한 장을 KudoRow로 읽는다. 없으면 undefined. */
async function selectKudo(id: number, visitorId: string | null): Promise<KudoRow | undefined> {
  const [row] = (await getSql()`select ${kudoColumns(visitorId)} from kudos k where k.id = ${id}`) as KudoRow[];
  return row;
}

/** 같은 받는 사람으로 묶는 기준: 앞뒤 공백을 자르고 소문자로 바꾼 이름. 클라이언트의 normalizeRecipient와 같은 규칙이다. */
const recipientKey = () => getSql()`lower(trim(k.recipient))`;

/** LIKE 패턴에서 %, _, \ 를 글자 그대로 찾도록 이스케이프한다. */
const likePattern = (text: string) => `%${text.replace(/[\\%_]/g, (c) => "\\" + c)}%`;

/**
 * 20개씩 돌려준다.
 * - 최신순(id desc): 커서는 이전 페이지 마지막 Kudo의 id다.
 * - 인기순(리액션 합계 desc, id desc): 커서는 다음 페이지의 시작 위치(offset)다.
 */
export async function listKudos(
  query: ListQuery = {},
  visitorId: string | null = null,
): Promise<KudoPage> {
  const { cursor, category, q, sort, to } = listQuerySchema.parse(query);
  const popular = sort === "popular";
  const offset = popular && cursor ? Number(cursor) : 0;
  const sql = getSql();
  const conditions = [];
  if (cursor && !popular) conditions.push(sql`k.id < ${Number(cursor)}`);
  if (category) conditions.push(sql`category = ${category}`);
  // 받는 사람은 공백을 자른 뒤 대소문자를 무시하고 정확히 같은 이름만 모은다(CONTEXT.md의 Recipient 규칙).
  if (to) conditions.push(sql`${recipientKey()} = lower(trim(${to}))`);
  if (q) {
    const p = likePattern(q);
    conditions.push(sql`(message ilike ${p} or author ilike ${p} or recipient ilike ${p})`);
  }
  const where = conditions.length
    ? sql`where ${conditions.reduce((acc, c) => sql`${acc} and ${c}`)}`
    : sql``;
  const rows = (await sql`
    select ${kudoColumns(visitorId)}
    from kudos k ${where}
    ${popular ? sql`order by ${reactionTotal()} desc, k.id desc` : sql`order by k.id desc`}
    limit ${PAGE_SIZE + 1} ${popular ? sql`offset ${offset}` : sql``}`) as KudoRow[];
  const items = rows.slice(0, PAGE_SIZE).map(toView);
  const hasMore = rows.length > PAGE_SIZE;
  const nextCursor = !hasMore ? null : popular ? String(offset + PAGE_SIZE) : String(items[items.length - 1].id);
  return { items, nextCursor };
}

/** 잘못된 입력은 횟수에 넣지 않고, 검증을 통과한 작성만 IP당 1분 5회까지 허용한다. */
export async function createKudo(input: unknown, ip: string): Promise<KudoView> {
  const data = createKudoSchema.parse(input);
  await consumeRateLimit("create", ip);
  const passwordHash = await hashPassword(data.password);
  const sql = getSql();
  const [row] = (await sql`
    insert into kudos (author, recipient, category, message, password_hash)
    values (${data.author}, ${data.recipient}, ${data.category}, ${data.message}, ${passwordHash})
    returning id, author, recipient, category, message, created_at, updated_at`) as KudoRow[];
  return toView(row);
}

const reactionParams = z.object({ id: z.string(), emoji: z.enum(EMOJIS) });

/** Reaction을 켜거나(on) 끈다. 목표 상태를 지정하므로 몇 번을 반복해도 결과가 같다. */
export async function setReaction(
  params: { id: string; emoji: string },
  visitorId: string,
  on: boolean,
): Promise<ReactionResult> {
  if (!isId(params.id)) throw notFound();
  const parsed = reactionParams.safeParse(params);
  if (!parsed.success) throw new HttpError(400, "VALIDATION_FAILED", "알 수 없는 리액션이에요");
  const { emoji } = parsed.data;
  const id = Number(parsed.data.id);
  const sql = getSql();

  const [exists] = await sql`select 1 from kudos where id = ${id}`;
  if (!exists) throw notFound();
  if (on) {
    await sql`insert into reactions (kudo_id, emoji, visitor_id) values (${id}, ${emoji}, ${visitorId}::uuid)
              on conflict do nothing`;
  } else {
    await sql`delete from reactions where kudo_id = ${id} and emoji = ${emoji} and visitor_id = ${visitorId}::uuid`;
  }
  const [state] = (await sql`
    select count(*) filter (where emoji = ${emoji})::int as count,
      coalesce(bool_or(emoji = ${emoji} and visitor_id = ${visitorId}::uuid), false) as reacted,
      count(*)::int as total
    from reactions where kudo_id = ${id}`) as (ReactionState & { total: number })[];
  return { emoji, count: state.count, reacted: state.reacted, temperature: kudoTemperature(state.total) };
}

function notFound() {
  return new HttpError(404, "NOT_FOUND", KUDO_GONE_MESSAGE);
}

/** Kudo 한 장. 없는 id나 잘못된 id는 404다. */
export async function getKudo(idParam: string, visitorId: string | null): Promise<KudoView> {
  if (!isId(idParam)) throw notFound();
  const row = await selectKudo(Number(idParam), visitorId);
  if (!row) throw notFound();
  return toView(row);
}

export async function getBoardStats(): Promise<BoardStats> {
  const sql = getSql();
  const [rows, topColleagues] = await Promise.all([
    sql`select (select count(*)::int from kudos) as "kudoCount",
               (select count(*)::int from reactions) as "reactionCount"`,
    getTopColleagues(),
  ]);
  const row = rows[0] as Pick<BoardStats, "kudoCount" | "reactionCount">;
  return { ...row, temperature: boardTemperature(row.reactionCount, row.kudoCount), topColleagues };
}

/**
 * 최근 7일 안에 작성된 Kudo를 받는 사람별로 묶어 동료 온도가 높은 3명을 고른다.
 * 이름은 공백 제거·소문자로 묶고, 표시는 가장 최근 Kudo의 표기를 쓴다. 동점이면 더 최근에 받은 사람이 앞이다.
 */
async function getTopColleagues(): Promise<TopColleague[]> {
  const rows = (await getSql()`
    with recent as (
      select k.id, k.recipient, k.created_at, ${recipientKey()} as person,
        ${reactionTotal()}::int as reactions
      from kudos k
      where k.recipient is not null and k.created_at > now() - interval '7 days'
    )
    select (array_agg(recipient order by created_at desc, id desc))[1] as name,
      count(*)::int as "kudoCount", sum(reactions)::int as "reactionCount", max(created_at) as latest
    from recent group by person`) as (Omit<TopColleague, "temperature"> & { latest: string | Date })[];
  return rows
    .map(({ latest, ...counts }) => ({
      colleague: { ...counts, temperature: colleagueTemperature(counts.kudoCount, counts.reactionCount) },
      latest: new Date(latest).getTime(),
    }))
    .sort((a, b) => b.colleague.temperature - a.colleague.temperature || b.latest - a.latest)
    .slice(0, 3)
    .map((entry) => entry.colleague);
}

/**
 * 비밀번호를 확인한다. Kudo가 없으면 404, 비밀번호가 틀리면 403.
 * 무차별 대입을 막기 위해 수정·삭제를 합쳐 IP당 1분 5회까지만 확인한다.
 */
async function authorize(idParam: string, password: string, ip: string): Promise<number> {
  if (!isId(idParam)) throw notFound();
  await consumeRateLimit("password", ip);
  const id = Number(idParam);
  const [row] = (await getSql()`select password_hash from kudos where id = ${id}`) as { password_hash: string }[];
  if (!row) throw notFound();
  if (!(await verifyPassword(password, row.password_hash))) {
    throw new HttpError(403, "INVALID_PASSWORD", "비밀번호가 일치하지 않습니다");
  }
  return id;
}

/** Message·Category·Recipient만 바꾼다. Author와 비밀번호는 바뀌지 않는다. */
export async function updateKudo(
  idParam: string,
  input: unknown,
  visitorId: string | null,
  ip: string,
): Promise<KudoView> {
  const data = updateKudoSchema.parse(input);
  const id = await authorize(idParam, data.password, ip);
  const sql = getSql();
  await sql`update kudos set category = ${data.category}, message = ${data.message},
              recipient = ${data.recipient}, updated_at = now()
            where id = ${id}`;
  const row = await selectKudo(id, visitorId);
  if (!row) throw notFound(); // 확인과 수정 사이에 삭제된 경우
  return toView(row);
}

/** 하드 삭제. 딸린 Reaction은 FK의 on delete cascade로 함께 지워진다. */
export async function deleteKudo(idParam: string, input: unknown, ip: string): Promise<void> {
  const { password } = deleteKudoSchema.parse(input);
  const id = await authorize(idParam, password, ip);
  await getSql()`delete from kudos where id = ${id}`;
}
