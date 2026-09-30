import { describe, expect, test } from "vitest";
import { z } from "zod";
import { HttpError, handle } from "@/lib/http";

async function body(res: Response) {
  return { status: res.status, json: await res.json() };
}

describe("공통 오류 변환", () => {
  test("HttpError는 상태 코드와 code, message를 그대로 싣는다", async () => {
    const res = await handle(async () => {
      throw new HttpError(403, "INVALID_PASSWORD", "비밀번호가 일치하지 않습니다");
    });
    expect(await body(res)).toEqual({
      status: 403,
      json: {
        error: { code: "INVALID_PASSWORD", message: "비밀번호가 일치하지 않습니다" },
      },
    });
  });

  test("검증 실패는 400 VALIDATION_FAILED와 필드별 오류를 돌려준다", async () => {
    const schema = z.object({ message: z.string().min(1, "메시지를 입력해 주세요") });
    const res = await handle(async () => {
      schema.parse({ message: "" });
      return Response.json({});
    });
    const { status, json } = await body(res);
    expect(status).toBe(400);
    expect(json.error.code).toBe("VALIDATION_FAILED");
    expect(json.error.fieldErrors).toEqual({ message: ["메시지를 입력해 주세요"] });
  });

  test("예상하지 못한 오류는 내부 정보를 숨기고 500을 돌려준다", async () => {
    const res = await handle(async () => {
      throw new Error("connection string leaked");
    });
    const { status, json } = await body(res);
    expect(status).toBe(500);
    expect(json.error.code).toBe("INTERNAL");
    expect(JSON.stringify(json)).not.toContain("leaked");
  });

  test("성공한 응답은 그대로 통과한다", async () => {
    const res = await handle(async () => Response.json({ ok: true }, { status: 201 }));
    expect(await body(res)).toEqual({ status: 201, json: { ok: true } });
  });
});
