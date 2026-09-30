import { describe, expect, test } from "vitest";
import { PATCH } from "@/app/api/kudos/[id]/route";
import { GET } from "@/app/api/kudos/route";
import { createKudo, jsonRequest, read } from "./helpers";

function edit(id: number | string, body: unknown) {
  return PATCH(jsonRequest(`/api/kudos/${id}`, "PATCH", body), { params: Promise.resolve({ id: String(id) }) });
}

const change = { password: "1234", category: "praise", message: "  내용을 고쳤어요  ", recipient: "현우" };

describe("Kudo 수정", () => {
  test("올바른 비밀번호면 200과 갱신된 Kudo를 돌려주고 editedAt이 채워진다", async () => {
    const kudo = await createKudo();
    const { status, json } = await read(await edit(kudo.id, change));
    expect(status).toBe(200);
    expect(json).toMatchObject({ id: kudo.id, category: "praise", message: "내용을 고쳤어요", recipient: "현우" });
    expect(json.editedAt).not.toBeNull();

    const [listed] = (await read(await GET(jsonRequest("/api/kudos", "GET")))).json.items;
    expect(listed).toMatchObject({ message: "내용을 고쳤어요", editedAt: json.editedAt });
  });

  test("작성자와 비밀번호는 바뀌지 않는다", async () => {
    const kudo = await createKudo();
    const { json } = await read(await edit(kudo.id, { ...change, author: "다른 사람", newPassword: "9999" }));
    expect(json.author).toBe(kudo.author);
    // 원래 비밀번호로 다시 수정할 수 있다
    expect((await edit(kudo.id, { ...change, message: "또 고침" })).status).toBe(200);
  });

  test("이름이 선택 입력이던 때 남은 '익명' Kudo도 비밀번호로 수정할 수 있다", async () => {
    const legacy = await createKudo({ author: "익명" });
    const { status, json } = await read(await edit(legacy.id, change));
    expect(status).toBe(200);
    expect(json.author).toBe("익명");
  });

  test("받는 사람을 비우면 null이 된다", async () => {
    const kudo = await createKudo();
    const { json } = await read(await edit(kudo.id, { ...change, recipient: "" }));
    expect(json.recipient).toBeNull();
  });

  test("틀린 비밀번호는 403 INVALID_PASSWORD이고 내용이 바뀌지 않는다", async () => {
    const kudo = await createKudo();
    const { status, json } = await read(await edit(kudo.id, { ...change, password: "0000" }));
    expect(status).toBe(403);
    expect(json.error).toMatchObject({ code: "INVALID_PASSWORD", message: "비밀번호가 일치하지 않습니다" });
    const [listed] = (await read(await GET(jsonRequest("/api/kudos", "GET")))).json.items;
    expect(listed).toMatchObject({ message: kudo.message, editedAt: null });
  });

  test("없는 id는 404 NOT_FOUND다", async () => {
    const { status, json } = await read(await edit(999999, change));
    expect(status).toBe(404);
    expect(json.error.code).toBe("NOT_FOUND");
    expect((await edit("abc", change)).status).toBe(404);
  });

  test("수정 내용도 작성과 같은 규칙으로 검증한다", async () => {
    const kudo = await createKudo();
    const { status, json } = await read(await edit(kudo.id, { ...change, message: "가".repeat(201) }));
    expect(status).toBe(400);
    expect(json.error.fieldErrors.message).toBeDefined();
    expect((await edit(kudo.id, { ...change, password: undefined })).status).toBe(400);
  });
});
