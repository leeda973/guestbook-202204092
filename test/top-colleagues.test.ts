import { describe, expect, test } from "vitest";
import { GET as boardStats } from "@/app/api/board/route";
import { PUT } from "@/app/api/kudos/[id]/reactions/[emoji]/route";
import { getSql } from "@/lib/db";
import { createKudo, jsonRequest, read } from "./helpers";

const visitor = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

async function react(id: number, times: number) {
  for (let i = 0; i < times; i++) {
    const req = jsonRequest(`/api/kudos/${id}/reactions/fire`, "PUT", undefined, { cookie: `kudos_visitor=${visitor(i)}` });
    await PUT(req, { params: Promise.resolve({ id: String(id), emoji: "fire" }) });
  }
}

/** 시간은 시스템 경계라, "오래된 Kudo"를 만들 때만 준비 단계에서 작성 시각을 옮긴다. 검증은 API로 한다. */
async function ageDays(id: number, days: number) {
  await getSql()`update kudos set created_at = now() - make_interval(days => ${days}) where id = ${id}`;
}

const top = async () => (await read(await boardStats())).json.topColleagues;

describe("이번 주 가장 따뜻한 동료", () => {
  test("Kudo가 없으면 빈 배열이다", async () => {
    expect(await top()).toEqual([]);
  });

  test("동료 온도 순으로 최대 3명을, 받은 Kudo·리액션 수와 함께 돌려준다", async () => {
    await createKudo({ recipient: "지영" });
    await createKudo({ recipient: "지영" }); // 지영: Kudo 2 → 36.9
    const b = await createKudo({ recipient: "현우" });
    await react(b.id, 5); // 현우: Kudo 1, 리액션 5 → 37.2
    await createKudo({ recipient: "서연" }); // 서연: 36.7
    await createKudo({ recipient: "도윤" });
    const d = await createKudo({ recipient: "도윤" });
    await react(d.id, 1); // 도윤: Kudo 2, 리액션 1 → 37.0

    expect(await top()).toEqual([
      { name: "현우", kudoCount: 1, reactionCount: 5, temperature: 37.2 },
      { name: "도윤", kudoCount: 2, reactionCount: 1, temperature: 37 },
      { name: "지영", kudoCount: 2, reactionCount: 0, temperature: 36.9 },
    ]);
  });

  test("동점이면 더 최근에 Kudo를 받은 사람이 앞이다", async () => {
    await createKudo({ recipient: "먼저" });
    await createKudo({ recipient: "나중" });
    expect((await top()).map((c: { name: string }) => c.name)).toEqual(["나중", "먼저"]);
  });

  test("공백·대소문자만 다른 이름은 합치고, 가장 최근 표기로 보여준다", async () => {
    await createKudo({ recipient: "jiyoung" });
    await createKudo({ recipient: "JiYoung " });
    await createKudo({ recipient: "Jiyoung" });
    expect(await top()).toEqual([{ name: "Jiyoung", kudoCount: 3, reactionCount: 0, temperature: 37.1 }]);
  });

  test("받는 사람이 없는 Kudo는 세지 않는다", async () => {
    await createKudo({ recipient: null });
    await createKudo({ recipient: "수진" });
    expect((await top()).map((c: { name: string }) => c.name)).toEqual(["수진"]);
  });

  test("최근 7일 밖에 작성된 Kudo는 세지 않는다", async () => {
    const old = await createKudo({ recipient: "예전" });
    await react(old.id, 10);
    await ageDays(old.id, 8);
    const recent = await createKudo({ recipient: "지금" });
    await ageDays(recent.id, 6);
    expect((await top()).map((c: { name: string }) => c.name)).toEqual(["지금"]);
  });
});
