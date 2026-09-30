// 클라이언트에서 API를 부르는 얇은 래퍼. 실패하면 서버가 준 한국어 message를 담은 ApiError를 던진다.
import { RETRY_LATER_MESSAGE, type ErrorCode, type FieldErrors } from "@/lib/http";

/** 서버 오류 코드와, 요청이 서버에 닿지 못한 경우의 NETWORK */
export type ClientErrorCode = ErrorCode | "NETWORK";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ClientErrorCode,
    message: string,
    readonly fieldErrors?: FieldErrors,
  ) {
    super(message);
  }
}

/** 비밀번호가 틀려 수정·삭제가 거부된 오류인지 */
export const isInvalidPassword = (e: unknown): e is ApiError => e instanceof ApiError && e.code === "INVALID_PASSWORD";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  } catch {
    throw new ApiError(0, "NETWORK", "네트워크 연결을 확인해 주세요");
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const e = body?.error;
    throw new ApiError(res.status, e?.code ?? "INTERNAL", e?.message ?? RETRY_LATER_MESSAGE, e?.fieldErrors);
  }
  return body as T;
}
