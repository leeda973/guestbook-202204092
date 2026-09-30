import { describe, expect, test } from "vitest";
import { GET, POST } from "@/app/api/kudos/route";
import { DELETE, PUT } from "@/app/api/kudos/[id]/reactions/[emoji]/route";
import { createKudo, jsonRequest, read, validKudo } from "./helpers";

const ALICE = "11111111-1111-4111-8111-111111111111";
const BOB = "22222222-2222-4222-8222-222222222222";
const cookie = (visitor?: string): Record<string, string> =>
  visitor ? { cookie: `kudos_visitor=${visitor}` } : {};

function react(method: "PUT" | "DELETE", id: number | string, emoji: string, visitor?: string) {
  const handler = method === "PUT" ? PUT : DELETE;
  const req = jsonRequest(`/api/kudos/${id}/reactions/${emoji}`, method, undefined, cookie(visitor));
  return handler(req, { params: Promise.resolve({ id: String(id), emoji }) });
}

async function listAs(visitor?: string) {
  return (await read(await GET(jsonRequest("/api/kudos", "GET", undefined, cookie(visitor))))).json.items;
}

describe("Reaction 켜기·끄기", () => {
  test("PUT으로 켜면 count 1, reacted true를 돌려준다", async () => {
    const id = (await createKudo()).id;
    const { status, json } = await read(await react("PUT", id, "fire", ALICE));
    expect(status).toBe(200);
    expect(json).toMatchObject({ emoji: "fire", count: 1, reacted: true });
  });

  test("같은 Visitor가 PUT을 반복해도 count는 1이다(멱등)", async () => {
    const id = (await createKudo()).id;
    await react("PUT", id, "heart", ALICE);
    await react("PUT", id, "heart", ALICE);
    const { json } = await read(await react("PUT", id, "heart", ALICE));
    expect(json).toMatchObject({ count: 1, reacted: true });
  });

  test("DELETE로 끄면 0이 되고, 누르지 않은 상태에서 DELETE해도 0이다", async () => {
    const id = (await createKudo()).id;
    await react("PUT", id, "clap", ALICE);
    expect((await read(await react("DELETE", id, "clap", ALICE))).json).toMatchObject({ count: 0, reacted: false });
    expect((await read(await react("DELETE", id, "clap", ALICE))).json).toMatchObject({ count: 0, reacted: false });
  });

  test("서로 다른 Visitor는 각각 집계되고, reacted는 요청한 Visitor 기준이다", async () => {
    const id = (await createKudo()).id;
    await react("PUT", id, "bulb", ALICE);
    const { json } = await read(await react("PUT", id, "bulb", BOB));
    expect(json).toMatchObject({ count: 2, reacted: true });

    await react("PUT", id, "fire", ALICE);
    const [asAlice] = await listAs(ALICE);
    const [asBob] = await listAs(BOB);
    const [anonymous] = await listAs();
    expect(asAlice.reactions).toEqual({
      fire: { count: 1, reacted: true },
      clap: { count: 0, reacted: false },
      heart: { count: 0, reacted: false },
      bulb: { count: 2, reacted: true },
    });
    expect(asBob.reactions.fire).toEqual({ count: 1, reacted: false });
    expect(asBob.reactions.bulb).toEqual({ count: 2, reacted: true });
    expect(anonymous.reactions.bulb).toEqual({ count: 2, reacted: false });
  });

  test("새로 작성한 Kudo는 네 Reaction이 모두 0이다", async () => {
    const created = (await read(await POST(jsonRequest("/api/kudos", "POST", validKudo)))).json;
    expect(Object.values(created.reactions)).toEqual(Array(4).fill({ count: 0, reacted: false }));
  });

  test("알 수 없는 이모지는 400, 없는 Kudo와 잘못된 id는 404다", async () => {
    const id = (await createKudo()).id;
    expect((await react("PUT", id, "smile", ALICE)).status).toBe(400);
    expect((await react("PUT", 999999, "fire", ALICE)).status).toBe(404);
    expect((await react("PUT", "abc", "fire", ALICE)).status).toBe(404);
    expect((await react("PUT", "99999999999", "fire", ALICE)).status).toBe(404);
  });
});

describe("Visitor 쿠키", () => {
  test("쿠키가 없으면 Reaction 요청 시 httpOnly Visitor 쿠키를 발급하고, 그 Visitor로 집계한다", async () => {
    const id = (await createKudo()).id;
    const res = await react("PUT", id, "fire");
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/^kudos_visitor=[0-9a-f-]{36};/);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(setCookie).toMatch(/Max-Age=31536000/);

    const visitor = setCookie.match(/^kudos_visitor=([^;]+)/)![1];
    const [kudo] = await listAs(visitor);
    expect(kudo.reactions.fire).toEqual({ count: 1, reacted: true });
  });

  test("이미 쿠키가 있으면 다시 발급하지 않는다", async () => {
    const id = (await createKudo()).id;
    const res = await react("PUT", id, "fire", ALICE);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  test("형식이 잘못된 쿠키는 새 Visitor로 취급한다", async () => {
    const id = (await createKudo()).id;
    const res = await react("PUT", id, "fire", "not-a-uuid");
    expect(res.headers.get("set-cookie")).toMatch(/^kudos_visitor=[0-9a-f-]{36};/);
  });
});
