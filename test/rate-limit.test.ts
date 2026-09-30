import { beforeEach, describe, expect, test } from "vitest";
import { DELETE, PATCH } from "@/app/api/kudos/[id]/route";
import { PUT } from "@/app/api/kudos/[id]/reactions/[emoji]/route";
import { POST } from "@/app/api/kudos/route";
import { getSql } from "@/lib/db";
import { createKudo, jsonRequest, read, validKudo } from "./helpers";

const from = (ip: string) => ({ "x-forwarded-for": `${ip}, 70.0.0.1` });
const create = (ip: string) => POST(jsonRequest("/api/kudos", "POST", validKudo, from(ip)));

/**
 * 제한은 DB 시각 기준 1분 고정 윈도로 센다. 한 테스트가 분 경계에 걸치면 31번째 요청이 새 윈도로 넘어가
 * 429가 나지 않으므로, 남은 시간이 넉넉하지 않으면 다음 분이 시작될 때까지 기다린 뒤 시작한다.
 */
const SAFE_SECONDS = 40; // 한 테스트는 30회 요청을 보내도 수십 초 안에 끝난다
async function startInFreshWindow() {
  const [{ remaining }] = (await getSql()`
    select 60 - extract(second from now())::float as remaining`) as { remaining: number }[];
  if (remaining < SAFE_SECONDS) await new Promise((r) => setTimeout(r, (remaining + 0.5) * 1000));
}

const LIMIT = 30; // 스펙 v3: 작성·비밀번호 확인 모두 IP당 1분 30회
const TIMEOUT = 90_000;

describe("요청 횟수 제한", () => {
  beforeEach(startInFreshWindow, SAFE_SECONDS * 1000 + 5_000);

  test("같은 IP의 30번째 작성까지는 통과하고 31번째는 429이며, 다른 IP는 영향이 없다", async () => {
    for (let i = 0; i < LIMIT; i++) expect((await create("1.1.1.1")).status).toBe(201);
    const { status, json } = await read(await create("1.1.1.1"));
    expect(status).toBe(429);
    expect(json.error).toMatchObject({ code: "RATE_LIMITED", message: "잠시 후 다시 시도해 주세요" });
    expect((await create("2.2.2.2")).status).toBe(201);
  }, TIMEOUT);

  test("전달 헤더의 첫 번째 IP로 센다", async () => {
    for (let i = 0; i < LIMIT; i++) {
      await POST(jsonRequest("/api/kudos", "POST", validKudo, { "x-forwarded-for": `3.3.3.3, 9.9.9.${i}` }));
    }
    const res = await POST(jsonRequest("/api/kudos", "POST", validKudo, { "x-forwarded-for": "3.3.3.3, 8.8.8.8" }));
    expect(res.status).toBe(429);
  }, TIMEOUT);

  test("비밀번호 확인(수정·삭제)은 합쳐서 IP당 1분 30회까지이고, 넘으면 올바른 비밀번호도 막힌다", async () => {
    const id = (await createKudo()).id;
    const params = { params: Promise.resolve({ id: String(id) }) };
    const wrongEdit = () =>
      PATCH(jsonRequest(`/api/kudos/${id}`, "PATCH", { password: "0000", category: "cheer", message: "x" }, from("4.4.4.4")), params);
    const wrongDelete = () => DELETE(jsonRequest(`/api/kudos/${id}`, "DELETE", { password: "0000" }, from("4.4.4.4")), params);

    for (let i = 0; i < LIMIT / 2; i++) expect((await wrongEdit()).status).toBe(403);
    for (let i = 0; i < LIMIT / 2; i++) expect((await wrongDelete()).status).toBe(403);
    expect((await wrongDelete()).status).toBe(429);
    expect((await DELETE(jsonRequest(`/api/kudos/${id}`, "DELETE", { password: "1234" }, from("4.4.4.4")), params)).status).toBe(429);
    // 다른 IP는 가능하다
    expect((await DELETE(jsonRequest(`/api/kudos/${id}`, "DELETE", { password: "1234" }, from("5.5.5.5")), params)).status).toBe(204);
  }, TIMEOUT);

  test("채점하듯 틀린 비밀번호를 여러 번 시험해도 매번 '비밀번호가 일치하지 않습니다'이고, 그 뒤 올바른 비밀번호로 성공한다", async () => {
    const kudo = await createKudo({ message: "원래 메시지" });
    const params = { params: Promise.resolve({ id: String(kudo.id) }) };
    const ip = from("6.6.6.6");
    const edit = (password: string) =>
      PATCH(jsonRequest(`/api/kudos/${kudo.id}`, "PATCH", { password, category: "cheer", message: "고친 메시지" }, ip), params);
    const remove = (password: string) => DELETE(jsonRequest(`/api/kudos/${kudo.id}`, "DELETE", { password }, ip), params);

    // 예전 한도(1분 5회)였다면 6번째부터 429가 나던 시나리오다.
    for (let i = 0; i < 6; i++) {
      const { status, json } = await read(await edit("0000"));
      expect(status).toBe(403);
      expect(json.error).toMatchObject({ code: "INVALID_PASSWORD", message: "비밀번호가 일치하지 않습니다" });
    }
    for (let i = 0; i < 6; i++) {
      const { status, json } = await read(await remove("0000"));
      expect(status).toBe(403);
      expect(json.error.message).toBe("비밀번호가 일치하지 않습니다");
    }
    const edited = await read(await edit("1234"));
    expect(edited.status).toBe(200);
    expect(edited.json.message).toBe("고친 메시지");
    expect((await remove("1234")).status).toBe(204);
  }, TIMEOUT);

  test("작성 제한과 비밀번호 확인 제한은 따로 센다", async () => {
    for (let i = 0; i < LIMIT; i++) await create("7.7.7.7");
    const id = (await createKudo()).id;
    const res = await DELETE(jsonRequest(`/api/kudos/${id}`, "DELETE", { password: "1234" }, from("7.7.7.7")), {
      params: Promise.resolve({ id: String(id) }),
    });
    expect(res.status).toBe(204);
  }, TIMEOUT);

  test("Reaction은 제한하지 않는다", async () => {
    const id = (await createKudo()).id;
    for (let i = 0; i < LIMIT + 5; i++) {
      const req = jsonRequest(`/api/kudos/${id}/reactions/fire`, "PUT", undefined, from("8.8.8.8"));
      expect((await PUT(req, { params: Promise.resolve({ id: String(id), emoji: "fire" }) })).status).toBe(200);
    }
  }, TIMEOUT);

  test("잘못된 입력은 작성 횟수에 넣지 않는다", async () => {
    for (let i = 0; i < LIMIT + 1; i++) {
      await POST(jsonRequest("/api/kudos", "POST", { ...validKudo, message: "" }, from("9.9.9.9")));
    }
    expect((await create("9.9.9.9")).status).toBe(201);
  }, TIMEOUT);
});
