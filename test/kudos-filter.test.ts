import { describe, expect, test } from "vitest";
import { GET, POST } from "@/app/api/kudos/route";
import { jsonRequest, read, validKudo } from "./helpers";

async function add(patch: Partial<typeof validKudo>) {
  await POST(jsonRequest("/api/kudos", "POST", { ...validKudo, ...patch }));
}

async function messages(query: string) {
  const { status, json } = await read(await GET(jsonRequest(`/api/kudos?${query}`, "GET")));
  expect(status).toBe(200);
  return json.items.map((k: { message: string }) => k.message);
}

describe("카테고리 필터", () => {
  test("고른 카테고리의 Kudo만 돌려준다", async () => {
    await add({ category: "cheer", message: "응원1" });
    await add({ category: "thanks", message: "감사1" });
    await add({ category: "cheer", message: "응원2" });
    expect(await messages("category=cheer")).toEqual(["응원2", "응원1"]);
    expect(await messages("category=praise")).toEqual([]);
  });

  test("알 수 없는 카테고리는 400이다", async () => {
    const { status } = await read(await GET(jsonRequest("/api/kudos?category=love", "GET")));
    expect(status).toBe(400);
  });
});

describe("검색", () => {
  test("메시지·작성자·받는 사람을 대소문자 구분 없이 부분 일치로 찾는다", async () => {
    await add({ message: "Great JOB today", author: "민수", recipient: "지영" });
    await add({ message: "고마워요", author: "Alice", recipient: null as unknown as string });
    await add({ message: "수고했어요", author: "철수", recipient: "Bob" });
    await add({ message: "관계없는 메시지", author: "영희", recipient: "현우" });
    expect(await messages("q=great job")).toEqual(["Great JOB today"]);
    expect(await messages("q=alice")).toEqual(["고마워요"]);
    expect(await messages("q=BOB")).toEqual(["수고했어요"]);
    expect(await messages("q=지영")).toEqual(["Great JOB today"]);
  });

  test("%, _, \\ 는 글자 그대로 찾는다", async () => {
    await add({ message: "진행률 100% 달성" });
    await add({ message: "진행률 1000 달성" });
    await add({ message: "snake_case 좋아요" });
    await add({ message: "snakeXcase 좋아요" });
    await add({ message: "경로는 C:\\temp" });
    expect(await messages(`q=${encodeURIComponent("100%")}`)).toEqual(["진행률 100% 달성"]);
    expect(await messages("q=e_c")).toEqual(["snake_case 좋아요"]);
    expect(await messages(`q=${encodeURIComponent("C:\\t")}`)).toEqual(["경로는 C:\\temp"]);
  });

  test("공백만 있는 검색어는 무시한다", async () => {
    await add({ message: "하나" });
    await add({ message: "둘" });
    expect(await messages("q=%20%20")).toEqual(["둘", "하나"]);
  });

  test("카테고리·검색과 커서 페이지네이션이 함께 동작한다", async () => {
    for (let i = 1; i <= 23; i++) await add({ category: "praise", message: `칭찬 ${i}` });
    for (let i = 1; i <= 5; i++) await add({ category: "cheer", message: `칭찬 아닌 응원 ${i}` });
    const first = (await read(await GET(jsonRequest("/api/kudos?category=praise&q=칭찬", "GET")))).json;
    expect(first.items).toHaveLength(20);
    const second = (
      await read(await GET(jsonRequest(`/api/kudos?category=praise&q=칭찬&cursor=${first.nextCursor}`, "GET")))
    ).json;
    expect(second.items.map((k: { message: string }) => k.message)).toEqual(["칭찬 3", "칭찬 2", "칭찬 1"]);
    expect(second.nextCursor).toBeNull();
  });
});
