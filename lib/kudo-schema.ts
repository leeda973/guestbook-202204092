// 클라이언트 폼과 서버가 함께 쓰는 Kudo 도메인 정의와 검증 스키마.
import { z } from "zod";

export const CATEGORIES = ["cheer", "feedback", "thanks", "praise"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  cheer: "응원",
  feedback: "피드백",
  thanks: "감사",
  praise: "칭찬",
};

export const MESSAGE_MAX = 200;

/** 없는 Kudo(삭제됐거나 주소가 틀림)를 알릴 때 쓰는 한 가지 문구 */
export const KUDO_GONE_MESSAGE = "이미 삭제되었거나 없는 Kudo예요";
const NAME_MAX = 20;
const AUTHOR_REQUIRED = "이름을 입력해 주세요";

const segmenter = new Intl.Segmenter("ko", { granularity: "grapheme" });

/** 화면에 보이는 글자 수. 이모지 조합(👨‍👩‍👧)도 한 글자로 센다. */
export function visibleLength(text: string) {
  return Array.from(segmenter.segment(text)).length;
}

/** 보이는 글자 기준으로 앞에서 max자까지만 남긴다. */
export function clipVisible(text: string, max: number) {
  return Array.from(segmenter.segment(text), (s) => s.segment).slice(0, max).join("");
}

/**
 * 이름 입력(Author의 이름, Recipient, 받는 사람 조건): 앞뒤 공백 제거, 보이는 글자 20자까지.
 * `requiredMessage`를 주면 빈 값을 그 문구로 거부한다.
 */
export const nameSchema = (label: string, requiredMessage?: string) => {
  const base = z.string(requiredMessage ? { error: requiredMessage } : undefined).trim();
  return (requiredMessage ? base.min(1, requiredMessage) : base).refine(
    (v) => visibleLength(v) <= NAME_MAX,
    `${label}은 ${NAME_MAX}자까지 쓸 수 있어요`,
  );
};

const kudoContentSchema = z.object({
  recipient: nameSchema("받는 사람")
    .nullish()
    .transform((v) => v || null),
  category: z.enum(CATEGORIES, { error: "카테고리를 골라 주세요" }),
  message: z
    .string({ error: "메시지를 입력해 주세요" })
    .trim()
    .min(1, "메시지를 입력해 주세요")
    .refine((v) => visibleLength(v) <= MESSAGE_MAX, `메시지는 ${MESSAGE_MAX}자까지 쓸 수 있어요`),
});

const passwordSchema = z
  .string({ error: "비밀번호를 입력해 주세요" })
  .min(4, "비밀번호는 4자 이상이에요")
  .max(20, "비밀번호는 20자까지 쓸 수 있어요");

export const createKudoSchema = kudoContentSchema.extend({
  // 과제 요구사항: 이름은 반드시 입력한다(CONTEXT.md의 Author).
  author: nameSchema("이름", AUTHOR_REQUIRED),
  password: passwordSchema,
});

/** 수정은 Message·Category·Recipient만 바꾼다. Author와 비밀번호는 바뀌지 않는다. */
export const updateKudoSchema = kudoContentSchema.extend({ password: passwordSchema });
export const deleteKudoSchema = z.object({ password: passwordSchema });

export const EMOJIS = ["fire", "clap", "heart", "bulb"] as const;
export type Emoji = (typeof EMOJIS)[number];

export const EMOJI_CHAR: Record<Emoji, string> = { fire: "🔥", clap: "👏", heart: "❤️", bulb: "💡" };
export const EMOJI_NAME: Record<Emoji, string> = { fire: "불꽃", clap: "박수", heart: "하트", bulb: "전구" };

export type ReactionState = { count: number; reacted: boolean };
export type Reactions = Record<Emoji, ReactionState>;

/** Reaction을 켜고 끈 뒤 서버가 돌려주는 해당 Kudo의 값 */
export type ReactionResult = { emoji: Emoji; temperature: number } & ReactionState;

export type KudoView = {
  id: number;
  author: string;
  recipient: string | null;
  category: Category;
  message: string;
  createdAt: string;
  editedAt: string | null;
  reactions: Reactions;
  temperature: number;
};

/** 이번 주 가장 따뜻한 동료 한 명. */
export type TopColleague = { name: string; kudoCount: number; reactionCount: number; temperature: number };

export type BoardStats = {
  kudoCount: number;
  reactionCount: number;
  temperature: number;
  /** 최근 7일 동료 온도 순 최대 3명 */
  topColleagues: TopColleague[];
};

/** 목록 API 한 페이지. nextCursor가 null이면 마지막 페이지다. */
export type KudoPage = { items: KudoView[]; nextCursor: string | null };

export const totalReactions = (reactions: Reactions) =>
  Object.values(reactions).reduce((sum, r) => sum + r.count, 0);

export const SORTS = ["latest", "popular"] as const;
export type Sort = (typeof SORTS)[number];

/** 목록 필터. 주소창 쿼리 문자열과 1:1로 대응한다. 정렬은 최신순이 기본이라 인기순일 때만 적는다. */
export type KudoFilters = { category?: Category; q?: string; sort?: Exclude<Sort, "latest">; to?: string };

export function parseFilters(get: (key: string) => string | null | undefined): KudoFilters {
  const category = get("category");
  const q = get("q")?.trim();
  const to = get("to")?.trim();
  return {
    ...((CATEGORIES as readonly string[]).includes(category ?? "") && { category: category as Category }),
    ...(q && { q }),
    ...(get("sort") === "popular" && { sort: "popular" as const }),
    ...(to && visibleLength(to) <= NAME_MAX && { to }),
  };
}

export function filtersToSearch(filters: KudoFilters) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.q) params.set("q", filters.q);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.to) params.set("to", filters.to);
  return params.toString();
}

/** 받는 사람 모아보기 주소. 보드의 `to` 필터로 이어진다. */
export const recipientHref = (name: string) => `/?${filtersToSearch({ to: name })}`;

/** 같은 받는 사람인지 비교할 때 쓰는 이름(앞뒤 공백 제거, 소문자). */
export const normalizeRecipient = (name: string) => name.trim().toLowerCase();
