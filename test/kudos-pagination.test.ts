import { describe, expect, test } from "vitest";
import { GET, POST } from "@/app/api/kudos/route";
import { jsonRequest, read, validKudo } from "./helpers";

const page = async (query = "") => read(await GET(jsonRequest(`/api/kudos${query}`, "GET")));

async function seed(n: number) {
  for (let i = 1; i <= n; i++) {
    await POST(jsonRequest("/api/kudos", "POST", { ...validKudo, message: `메시지 ${i}` }));
  }
}

describe("목록 커서 페이지네이션", () => {
  test("45개를 20·20·5개 세 페이지로 중복·누락 없이 받는다", async () => {
    await seed(45);
    const seen: string[] = [];
    let cursor: string | null = null;
    const sizes: number[] = [];
    do {
      const { status, json } = await page(cursor ? `?cursor=${cursor}` : "");
      expect(status).toBe(200);
      sizes.push(json.items.length);
      seen.push(...json.items.map((k: { message: string }) => k.message));
      cursor = json.nextCursor;
    } while (cursor);

    expect(sizes).toEqual([20, 20, 5]);
    expect(seen).toEqual(Array.from({ length: 45 }, (_, i) => `메시지 ${45 - i}`));
  });

  test("정확히 20개면 다음 커서가 없다", async () => {
    await seed(20);
    const { json } = await page();
    expect(json.items).toHaveLength(20);
    expect(json.nextCursor).toBeNull();
  });

  test.each(["abc", "-1", "1.5", "", "99999999999"])("해석할 수 없는 커서 %j는 400이다", async (cursor) => {
    const { status, json } = await page(`?cursor=${encodeURIComponent(cursor)}`);
    expect(status).toBe(400);
    expect(json.error.code).toBe("VALIDATION_FAILED");
  });
});
