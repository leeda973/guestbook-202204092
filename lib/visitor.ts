// 익명 Visitor 식별. 계정 대신 httpOnly 쿠키의 UUID로 "누가 Reaction을 눌렀는지"를 구분한다.
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

const VISITOR_COOKIE = "kudos_visitor";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ONE_YEAR = 60 * 60 * 24 * 365;

function parseVisitorId(value: string | undefined | null): string | null {
  return value && UUID.test(value) ? value : null;
}

export function visitorFromRequest(request: Request): string | null {
  const header = request.headers.get("cookie") ?? "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${VISITOR_COOKIE}=([^;]*)`));
  return parseVisitorId(match?.[1]);
}

/** 기존 Visitor ID를 쓰거나, 없으면 새로 만들고 응답에 실을 Set-Cookie 값을 함께 돌려준다. */
export function ensureVisitor(request: Request): { id: string; setCookie?: string } {
  const existing = visitorFromRequest(request);
  if (existing) return { id: existing };
  const id = randomUUID();
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return { id, setCookie: `${VISITOR_COOKIE}=${id}; Path=/; Max-Age=${ONE_YEAR}; HttpOnly; SameSite=Lax${secure}` };
}

/** Server Component에서 요청 쿠키의 Visitor ID를 읽는다. 없거나 형식이 틀리면 null. */
export async function visitorFromCookies(): Promise<string | null> {
  return parseVisitorId((await cookies()).get(VISITOR_COOKIE)?.value);
}
