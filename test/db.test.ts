import { expect, test } from "vitest";
import { getSql } from "@/lib/db";

test("테스트 DB에 연결되고 마이그레이션 이력 테이블이 있다", async () => {
  const sql = getSql();
  const rows = await sql`select count(*)::int as n from schema_migrations`;
  expect(rows[0].n).toBeGreaterThanOrEqual(0);
});
