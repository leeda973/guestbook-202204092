import { getSql } from "@/lib/db";
import { HttpError, RETRY_LATER_MESSAGE } from "@/lib/http";

type LimitedAction = "create" | "password";
// 도배·무차별 대입은 막되, 같은 네트워크의 여러 채점자가 시험해도 걸리지 않을 만큼 둔다(스펙 v3).
const LIMIT_PER_MINUTE = 30;

/** 이번 1분 윈도의 횟수를 1 늘리고, 한도를 넘으면 429를 던진다. 지난 윈도 기록은 같은 쿼리에서 정리한다. */
export async function consumeRateLimit(action: LimitedAction, ip: string) {
  const [row] = (await getSql()`
    with cleanup as (delete from rate_limits where window_start < now() - interval '5 minutes')
    insert into rate_limits (key, window_start) values (${`${action}:${ip}`}, date_trunc('minute', now()))
    on conflict (key, window_start) do update set count = rate_limits.count + 1
    returning count`) as { count: number }[];
  if (row.count > LIMIT_PER_MINUTE) {
    throw new HttpError(429, "RATE_LIMITED", RETRY_LATER_MESSAGE);
  }
}
