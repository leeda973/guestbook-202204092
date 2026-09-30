import { describe, expect, test } from "vitest";
import { GET, POST } from "@/app/api/kudos/route";
import { jsonRequest, read, validKudo } from "./helpers";

const create = (body: unknown) => POST(jsonRequest("/api/kudos", "POST", body));
const list = async () => (await read(await GET(jsonRequest("/api/kudos", "GET")))).json;

describe("Kudo 작성", () => {
  test("정상 요청은 201과 KudoView를 돌려주고 목록에 나타난다", async () => {
    const { status, json } = await read(await create(validKudo));
    expect(status).toBe(201);
    expect(json).toMatchObject({
      author: "민수",
      recipient: "지영",
      category: "thanks",
      message: "발표 자료 정리해 줘서 고마워요!",
      editedAt: null,
    });
    expect(typeof json.id).toBe("number");
    expect(Number.isNaN(Date.parse(json.createdAt))).toBe(false);

    const { items } = await list();
    expect(items.map((k: { id: number }) => k.id)).toEqual([json.id]);
  });

  test("응답 어디에도 비밀번호 관련 필드가 없다", async () => {
    const created = (await read(await create(validKudo))).json;
    const listed = (await list()).items[0];
    for (const view of [created, listed]) {
      expect(JSON.stringify(view)).not.toMatch(/password|1234/i);
    }
  });

  test("앞뒤 공백을 정리하고, 빈 받는 사람은 null이 된다", async () => {
    const { json } = await read(
      await create({ ...validKudo, author: "  다은  ", recipient: "  ", message: "  응원해요  " }),
    );
    expect(json).toMatchObject({ author: "다은", recipient: null, message: "응원해요" });
  });

  test("받는 사람은 생략해도 된다", async () => {
    const { status, json } = await read(
      await create({ author: "다은", category: "cheer", message: "화이팅", password: "abcd" }),
    );
    expect(status).toBe(201);
    expect(json).toMatchObject({ author: "다은", recipient: null });
  });

  test.each([
    ["이름 생략", { author: undefined }],
    ["빈 이름", { author: "" }],
    ["공백만 있는 이름", { author: "   " }],
    ["null 이름", { author: null }],
  ])("%s은 400이고 '이름을 입력해 주세요' 안내가 나온다", async (_name, patch) => {
    const { status, json } = await read(await create({ ...validKudo, ...patch }));
    expect(status).toBe(400);
    expect(json.error.code).toBe("VALIDATION_FAILED");
    expect(json.error.fieldErrors.author).toEqual(["이름을 입력해 주세요"]);
    expect((await list()).items).toEqual([]);
  });

  test("이모지 이름은 보이는 글자 수로 세어 20자까지 허용한다(DB 오류로 500이 나지 않는다)", async () => {
    const hearts = (n: number) => "❤️".repeat(n); // ❤️는 보이는 글자 1개, 코드 포인트 2개
    const ok = await read(await create({ ...validKudo, author: hearts(20), recipient: hearts(20) }));
    expect(ok.status).toBe(201);
    expect(ok.json).toMatchObject({ author: hearts(20), recipient: hearts(20) });

    const tooLong = await read(await create({ ...validKudo, author: hearts(21) }));
    expect(tooLong.status).toBe(400);
    expect(tooLong.json.error.fieldErrors.author).toBeDefined();
  });

  test("코드 포인트가 많은 이모지 메시지도 보이는 글자 200자까지 허용한다", async () => {
    const family = "👨‍👩‍👧‍👦"; // 보이는 글자 1개, 코드 포인트 7개
    expect((await create({ ...validKudo, message: family.repeat(200) })).status).toBe(201);
    expect((await create({ ...validKudo, message: family.repeat(201) })).status).toBe(400);
  });

  test("이모지가 섞여도 보이는 글자 수 200자까지는 허용한다", async () => {
    const message = "👨‍👩‍👧".repeat(200);
    const { status } = await read(await create({ ...validKudo, message }));
    expect(status).toBe(201);
  });

  test.each([
    ["메시지 누락", { message: undefined }, "message"],
    ["공백만 있는 메시지", { message: "   " }, "message"],
    ["200자 초과 메시지", { message: "가".repeat(201) }, "message"],
    ["20자 초과 작성자", { author: "가".repeat(21) }, "author"],
    ["20자 초과 받는 사람", { recipient: "가".repeat(21) }, "recipient"],
    ["알 수 없는 카테고리", { category: "love" }, "category"],
    ["4자 미만 비밀번호", { password: "123" }, "password"],
    ["20자 초과 비밀번호", { password: "a".repeat(21) }, "password"],
  ])("%s는 400 VALIDATION_FAILED와 해당 필드 오류를 돌려준다", async (_name, patch, field) => {
    const { status, json } = await read(await create({ ...validKudo, ...patch }));
    expect(status).toBe(400);
    expect(json.error.code).toBe("VALIDATION_FAILED");
    expect(json.error.fieldErrors[field]?.length).toBeGreaterThan(0);
    expect((await list()).items).toEqual([]);
  });

  test("JSON이 아닌 본문은 400이다", async () => {
    const res = await POST(
      new Request("http://localhost/api/kudos", { method: "POST", body: "not json" }),
    );
    const { status, json } = await read(res);
    expect(status).toBe(400);
    expect(json.error.code).toBe("VALIDATION_FAILED");
  });
});

describe("Kudo 목록", () => {
  test("최신 Kudo가 먼저 오고, 최대 20개까지 돌려준다", async () => {
    for (let i = 1; i <= 22; i++) {
      await create({ ...validKudo, message: `메시지 ${i}` });
    }
    const { items } = await list();
    expect(items).toHaveLength(20);
    expect(items[0].message).toBe("메시지 22");
    expect(items[19].message).toBe("메시지 3");
  });

  test("Kudo가 없으면 빈 목록이다", async () => {
    expect((await list()).items).toEqual([]);
  });
});
