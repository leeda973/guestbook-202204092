import { ZodError, z } from "zod";

export type ErrorCode =
  | "VALIDATION_FAILED"
  | "INVALID_PASSWORD"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL";

export type FieldErrors = Record<string, string[]>;

/** 원인을 알릴 수 없는 실패(서버 오류, 요청 횟수 초과)에 쓰는 안내 문구 */
export const RETRY_LATER_MESSAGE = "잠시 후 다시 시도해 주세요";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly fieldErrors?: FieldErrors,
  ) {
    super(message);
  }
}

function errorJson(status: number, code: ErrorCode, message: string, fieldErrors?: FieldErrors) {
  return Response.json({ error: { code, message, ...(fieldErrors && { fieldErrors }) } }, { status });
}

/** Route Handler 본문을 감싸 HttpError·검증 실패를 스펙의 실패 응답 형태로 바꾼다. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof HttpError) return errorJson(e.status, e.code, e.message, e.fieldErrors);
    if (e instanceof ZodError) {
      const fieldErrors = z.flattenError(e).fieldErrors as FieldErrors;
      return errorJson(400, "VALIDATION_FAILED", "입력값을 확인해 주세요", fieldErrors);
    }
    console.error(e);
    return errorJson(500, "INTERNAL", RETRY_LATER_MESSAGE);
  }
}

/** 요청 본문을 JSON으로 읽는다. JSON이 아니면 400. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "VALIDATION_FAILED", "요청 형식이 올바르지 않아요");
  }
}

/** 요청한 곳의 IP. Vercel이 넣어주는 전달 헤더의 첫 값이며, 없으면 "unknown"으로 묶는다. */
export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
