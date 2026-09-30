import { describe, expect, test } from "vitest";
import { GET as boardStats } from "@/app/api/board/route";
import { DELETE } from "@/app/api/kudos/[id]/route";
import { PUT } from "@/app/api/kudos/[id]/reactions/[emoji]/route";
import { GET } from "@/app/api/kudos/route";
import { createKudo, jsonRequest, read } from "./helpers";

function remove(id: number | string, body: unknown) {
  return DELETE(jsonRequest(`/api/kudos/${id}`, "DELETE", body), { params: Promise.resolve({ id: String(id) }) });
}

const listIds = async () =>
  (await read(await GET(jsonRequest("/api/kudos", "GET")))).json.items.map((k: { id: number }) => k.id);

describe("Kudo 삭제", () => {
  test("올바른 비밀번호면 204이고 목록에서 사라진다", async () => {
    const keep = (await createKudo()).id;
    const gone = (await createKudo()).id;
    const res = await remove(gone, { password: "1234" });
    expect(res.status).toBe(204);
    expect(await listIds()).toEqual([keep]);
  });

  test("삭제된 Kudo의 Reaction도 함께 사라진다", async () => {
    const id = (await createKudo()).id;
    const req = jsonRequest(`/api/kudos/${id}/reactions/fire`, "PUT", undefined, {
      cookie: "kudos_visitor=11111111-1111-4111-8111-111111111111",
    });
    await PUT(req, { params: Promise.resolve({ id: String(id), emoji: "fire" }) });
    expect((await read(await boardStats())).json.reactionCount).toBe(1);

    await remove(id, { password: "1234" });
    expect((await read(await boardStats())).json).toMatchObject({ kudoCount: 0, reactionCount: 0 });
  });

  test("틀린 비밀번호는 403이고 지워지지 않는다", async () => {
    const id = (await createKudo()).id;
    const { status, json } = await read(await remove(id, { password: "0000" }));
    expect(status).toBe(403);
    expect(json.error.code).toBe("INVALID_PASSWORD");
    expect(await listIds()).toEqual([id]);
  });

  test("없는 id는 404, 비밀번호 누락은 400이다", async () => {
    expect((await remove(999999, { password: "1234" })).status).toBe(404);
    const id = (await createKudo()).id;
    expect((await remove(id, {})).status).toBe(400);
  });

  test("이미 삭제된 Kudo를 다시 삭제하면 404다", async () => {
    const id = (await createKudo()).id;
    await remove(id, { password: "1234" });
    const { status, json } = await read(await remove(id, { password: "1234" }));
    expect(status).toBe(404);
    expect(json.error.message).toBe("이미 삭제되었거나 없는 Kudo예요");
  });
});
