import { beforeEach } from "vitest";
import { getSql } from "@/lib/db";

// 각 테스트 전에 앱 테이블을 모두 비운다(마이그레이션 이력은 남긴다).
beforeEach(async () => {
  const sql = getSql();
  const rows = await sql`
    select tablename from pg_tables
    where schemaname = 'public' and tablename <> 'schema_migrations'`;
  if (rows.length === 0) return;
  const tables = rows.map((r) => `"${r.tablename}"`).join(", ");
  await sql.query(`truncate ${tables} restart identity cascade`);
});
