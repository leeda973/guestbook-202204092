import { POST } from "@/app/api/kudos/route";
import type { KudoView } from "@/lib/kudo-schema";

export const BASE = "http://localhost";

let ipCounter = 0;
/** 요청마다 다른 IP. 요청 횟수 제한이 다른 테스트에 끼어들지 않게 한다. */
export const uniqueIp = () => `10.0.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`;

export function jsonRequest(path: string, method: string, body?: unknown, headers: Record<string, string> = {}) {
  return new Request(BASE + path, {
    method,
    headers: { "content-type": "application/json", "x-forwarded-for": uniqueIp(), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function read(res: Response) {
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
}

export const validKudo = {
  author: "민수",
  recipient: "지영",
  category: "thanks",
  message: "발표 자료 정리해 줘서 고마워요!",
  password: "1234",
};

/** API로 Kudo 하나를 만들고 응답(KudoView)을 돌려준다. */
export async function createKudo(patch: Record<string, unknown> = {}): Promise<KudoView> {
  return (await read(await POST(jsonRequest("/api/kudos", "POST", { ...validKudo, ...patch })))).json;
}
