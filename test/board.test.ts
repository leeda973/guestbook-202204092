import { expect, test } from "vitest";
import { GET as boardStats } from "@/app/api/board/route";
import { GET, POST } from "@/app/api/kudos/route";
import { PUT } from "@/app/api/kudos/[id]/reactions/[emoji]/route";
import { jsonRequest, read, validKudo } from "./helpers";

const visitor = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

async function react(id: number, emoji: string, n: number) {
  const req = jsonRequest(`/api/kudos/${id}/reactions/${emoji}`, "PUT", undefined, { cookie: `kudos_visitor=${visitor(n)}` });
  return read(await PUT(req, { params: Promise.resolve({ id: String(id), emoji }) }));
}

test("빈 Board는 0개, 36.5°다", async () => {
  expect((await read(await boardStats())).json).toEqual({ kudoCount: 0, reactionCount: 0, temperature: 36.5, topColleagues: [] });
});

test("Board 통계와 각 Kudo 온도가 실제 데이터와 일치한다", async () => {
  const a = (await read(await POST(jsonRequest("/api/kudos", "POST", validKudo)))).json;
  expect(a.temperature).toBe(36.5);
  const b = (await read(await POST(jsonRequest("/api/kudos", "POST", validKudo)))).json;

  await react(a.id, "fire", 1);
  await react(a.id, "heart", 1);
  const last = await react(a.id, "fire", 2);
  expect(last.json).toMatchObject({ count: 2, reacted: true, temperature: 38 }); // A 합계 3
  await react(b.id, "clap", 1);

  expect((await read(await boardStats())).json).toEqual({
    kudoCount: 2,
    reactionCount: 4,
    temperature: 37.3,
    // 두 Kudo 모두 받는 사람이 "지영"이다(validKudo)
    topColleagues: [{ name: "지영", kudoCount: 2, reactionCount: 4, temperature: 37.3 }],
  });

  const items = (await read(await GET(jsonRequest("/api/kudos", "GET")))).json.items;
  expect(items.map((k: { temperature: number }) => k.temperature)).toEqual([37, 38]);
});
