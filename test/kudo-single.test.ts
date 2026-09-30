import { describe, expect, test } from "vitest";
import { GET } from "@/app/api/kudos/[id]/route";
import { PUT } from "@/app/api/kudos/[id]/reactions/[emoji]/route";
import { createKudo, jsonRequest, read } from "./helpers";

const ALICE = "11111111-1111-4111-8111-111111111111";

function getOne(id: number | string, visitor?: string) {
  const headers: Record<string, string> = visitor ? { cookie: `kudos_visitor=${visitor}` } : {};
  return GET(jsonRequest(`/api/kudos/${id}`, "GET", undefined, headers), { params: Promise.resolve({ id: String(id) }) });
}

describe("Kudo 단건 조회", () => {
  test("200과 목록과 같은 모양의 KudoView를 돌려준다", async () => {
    const kudo = await createKudo({ recipient: "지영", message: "단건 조회" });
    const { status, json } = await read(await getOne(kudo.id));
    expect(status).toBe(200);
    expect(json).toEqual(kudo);
  });

  test("reacted는 요청한 Visitor 기준이다", async () => {
    const kudo = await createKudo();
    const req = jsonRequest(`/api/kudos/${kudo.id}/reactions/heart`, "PUT", undefined, { cookie: `kudos_visitor=${ALICE}` });
    await PUT(req, { params: Promise.resolve({ id: String(kudo.id), emoji: "heart" }) });

    expect((await read(await getOne(kudo.id, ALICE))).json.reactions.heart).toEqual({ count: 1, reacted: true });
    expect((await read(await getOne(kudo.id))).json.reactions.heart).toEqual({ count: 1, reacted: false });
    expect((await read(await getOne(kudo.id))).json.temperature).toBe(37);
  });

  test("없는 id와 잘못된 id는 404다", async () => {
    const { status, json } = await read(await getOne(999999));
    expect(status).toBe(404);
    expect(json.error).toMatchObject({ code: "NOT_FOUND", message: "이미 삭제되었거나 없는 Kudo예요" });
    expect((await getOne("abc")).status).toBe(404);
    expect((await getOne("99999999999")).status).toBe(404);
  });
});
