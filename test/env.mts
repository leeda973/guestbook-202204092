import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";

/**
 * 테스트는 .env.test의 DATABASE_URL만 쓴다. 테스트가 테이블을 비우므로,
 * 파일이 없거나 개발 DB와 같은 주소면 실수로 개발 데이터를 지우지 않도록 멈춘다.
 */
export function loadTestEnv(): Record<string, string> {
  if (!existsSync(".env.test")) {
    throw new Error(".env.test가 없습니다. test 브랜치의 DATABASE_URL을 넣어 주세요 (티켓 01)");
  }
  const env = parseEnv(readFileSync(".env.test", "utf8")) as Record<string, string>;
  if (!env.DATABASE_URL) throw new Error(".env.test에 DATABASE_URL이 없습니다");
  if (existsSync(".env.local")) {
    const local = parseEnv(readFileSync(".env.local", "utf8")) as Record<string, string>;
    if (local.DATABASE_URL === env.DATABASE_URL) {
      throw new Error(".env.test와 .env.local이 같은 DB를 가리킵니다. test 브랜치를 따로 써 주세요");
    }
  }
  return env;
}
