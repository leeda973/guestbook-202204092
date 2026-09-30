// db/migrations/의 번호 붙은 .sql 파일 중 미적용분만 순서대로 적용한다.
// 사용: node --env-file=.env.local scripts/migrate.mts
import { Pool } from "@neondatabase/serverless";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const migrationsDir = fileURLToPath(new URL("../db/migrations/", import.meta.url));

export async function migrate(databaseUrl: string): Promise<string[]> {
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  const applied: string[] = [];
  try {
    await client.query(
      "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())",
    );
    const done = new Set(
      (await client.query<{ name: string }>("select name from schema_migrations")).rows.map((r) => r.name),
    );
    const files = (await readdir(migrationsDir)).filter((f) => f.endsWith(".sql")).sort();
    for (const file of files) {
      if (done.has(file)) continue;
      const text = await readFile(join(migrationsDir, file), "utf8");
      await client.query("begin");
      try {
        await client.query(text);
        await client.query("insert into schema_migrations (name) values ($1)", [file]);
        await client.query("commit");
      } catch (e) {
        await client.query("rollback");
        throw new Error(`마이그레이션 실패: ${file}`, { cause: e });
      }
      applied.push(file);
    }
  } finally {
    client.release();
    await pool.end();
  }
  return applied;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL이 설정되지 않았습니다");
  const applied = await migrate(url);
  console.log(applied.length ? `적용: ${applied.join(", ")}` : "적용할 마이그레이션이 없습니다");
}
