import { describe, expect, test } from "vitest";
import { GET } from "@/app/api/kudos/route";
import { createKudo, jsonRequest, read } from "./helpers";

async function list(query: string) {
  return read(await GET(jsonRequest(`/api/kudos?${query}`, "GET")));
}
async function messages(query: string) {
  const { status, json } = await list(query);
  expect(status).toBe(200);
  return json.items.map((k: { message: string }) => k.message);
}
const to = (name: string) => `to=${encodeURIComponent(name)}`;

describe("받는 사람별 모아보기", () => {
  test("받는 사람 이름이 정확히 같은 Kudo만 돌려준다(부분 일치 제외)", async () => {
    await createKudo({ recipient: "지영", message: "지영1" });
    await createKudo({ recipient: "김지영", message: "김지영" });
    await createKudo({ recipient: "지영이", message: "지영이" });
    await createKudo({ recipient: null, message: "모두에게" });
    await createKudo({ recipient: "지영", message: "지영2" });
    expect(await messages(to("지영"))).toEqual(["지영2", "지영1"]);
  });

  test("앞뒤 공백과 대소문자는 무시한다", async () => {
    await createKudo({ recipient: "Jiyoung", message: "대문자" });
    await createKudo({ recipient: "jiyoung", message: "소문자" });
    expect(await messages(to("  JIYOUNG "))).toEqual(["소문자", "대문자"]);
  });

  test("카테고리·검색·인기순과 함께 동작한다", async () => {
    await createKudo({ recipient: "현우", category: "thanks", message: "고마워요 현우" });
    await createKudo({ recipient: "현우", category: "cheer", message: "힘내요 현우" });
    await createKudo({ recipient: "서연", category: "thanks", message: "고마워요 서연" });
    expect(await messages(`${to("현우")}&category=thanks`)).toEqual(["고마워요 현우"]);
    expect(await messages(`${to("현우")}&q=${encodeURIComponent("힘내")}`)).toEqual(["힘내요 현우"]);
    expect((await messages(`${to("현우")}&sort=popular`)).sort()).toEqual(["고마워요 현우", "힘내요 현우"]);
  });

  test("커서로 이어 받아도 그 사람의 Kudo만 온다", async () => {
    for (let i = 1; i <= 22; i++) await createKudo({ recipient: "도윤", message: `도윤 ${i}` });
    await createKudo({ recipient: "다른 사람", message: "다른" });
    const first = (await list(to("도윤"))).json;
    expect(first.items).toHaveLength(20);
    const second = (await list(`${to("도윤")}&cursor=${first.nextCursor}`)).json;
    expect(second.items.map((k: { message: string }) => k.message)).toEqual(["도윤 2", "도윤 1"]);
  });

  test("빈 값은 무시하고, 20자를 넘으면 400이다", async () => {
    await createKudo({ recipient: "수진", message: "A" });
    await createKudo({ recipient: null, message: "B" });
    expect(await messages("to=%20")).toEqual(["B", "A"]);
    const { status, json } = await list(to("가".repeat(21)));
    expect(status).toBe(400);
    expect(json.error.fieldErrors.to).toBeDefined();
  });
});
