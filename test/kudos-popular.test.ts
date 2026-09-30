import { describe, expect, test } from "vitest";
import { GET, POST } from "@/app/api/kudos/route";
import { PUT } from "@/app/api/kudos/[id]/reactions/[emoji]/route";
import { jsonRequest, read, validKudo } from "./helpers";

const visitor = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

async function add(message: string, category = "thanks") {
  return (await read(await POST(jsonRequest("/api/kudos", "POST", { ...validKudo, message, category })))).json.id as number;
}

async function react(id: number, times: number, emoji = "fire") {
  for (let i = 0; i < times; i++) {
    const req = jsonRequest(`/api/kudos/${id}/reactions/${emoji}`, "PUT", undefined, { cookie: `kudos_visitor=${visitor(i)}` });
    await PUT(req, { params: Promise.resolve({ id: String(id), emoji }) });
  }
}

async function get(query: string) {
  return read(await GET(jsonRequest(`/api/kudos?${query}`, "GET")));
}
const messages = (json: { items: { message: string }[] }) => json.items.map((k) => k.message);

describe("인기순 정렬", () => {
  test("리액션 합계가 많은 순이고, 합계가 같으면 최신 Kudo가 먼저다", async () => {
    const a = await add("A");
    const b = await add("B");
    const c = await add("C");
    await add("D");
    await react(a, 2);
    await react(a, 1, "heart"); // A 합계 3
    await react(b, 1); // B 합계 1
    await react(c, 1); // C 합계 1, B보다 최신
    const { status, json } = await get("sort=popular");
    expect(status).toBe(200);
    expect(messages(json)).toEqual(["A", "C", "B", "D"]);
  });

  test("offset 커서로 페이지를 이어 받으면 중복·누락이 없다", async () => {
    for (let i = 1; i <= 25; i++) await add(`K${i}`);
    const first = (await get("sort=popular")).json;
    expect(first.items).toHaveLength(20);
    expect(first.nextCursor).toBe("20");
    const second = (await get(`sort=popular&cursor=${first.nextCursor}`)).json;
    expect(second.nextCursor).toBeNull();
    const all = [...messages(first), ...messages(second)];
    expect(new Set(all).size).toBe(25);
  });

  test("카테고리 필터와 함께 동작한다", async () => {
    const x = await add("응원 X", "cheer");
    await add("감사 Y", "thanks");
    await add("응원 Z", "cheer");
    await react(x, 2);
    expect(messages((await get("sort=popular&category=cheer")).json)).toEqual(["응원 X", "응원 Z"]);
  });

  test("알 수 없는 정렬은 400이다", async () => {
    expect((await get("sort=random")).status).toBe(400);
  });

  test("정렬을 생략하면 최신순이다", async () => {
    const a = await add("오래된");
    await add("최신");
    await react(a, 3);
    expect(messages((await get("")).json)).toEqual(["최신", "오래된"]);
  });
});
