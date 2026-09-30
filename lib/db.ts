import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | undefined;

/** 서버 코드 전용. Neon HTTP 드라이버라 서버리스 환경에서도 커넥션이 쌓이지 않는다(ADR 0001). */
export function getSql() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL이 설정되지 않았습니다");
    sql = neon(url);
  }
  return sql;
}
