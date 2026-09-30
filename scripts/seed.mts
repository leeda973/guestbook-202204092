// 예시 Kudo 6개와 Reaction을 넣는다. 여러 번 실행해도 이전 시드를 지우고 다시 넣으므로 중복되지 않는다.
// 사용: npm run db:seed (개발 DB) / node --env-file=.env.prod scripts/seed.mts (운영 DB)
import { getSql } from "../lib/db.ts";
import { EMOJIS, type Category } from "../lib/kudo-schema.ts";
import { hashPassword, verifyPassword } from "../lib/password.ts";

const SEED_PASSWORD = "seed1234";

// [작성자, 받는 사람, 카테고리, 메시지, 이모지별 리액션 수(fire, clap, heart, bulb)]
// 네 카테고리가 모두 나오고, 받는 사람이 있는 Kudo가 있어 Top 3·모아보기·온도 색 구간(40° 이상 포함)을 둘러볼 수 있게 고른다.
const KUDOS: [string, string | null, Category, string, [number, number, number, number]][] = [
  ["민수", "지영", "thanks", "어제 늦게까지 배포 도와줘서 정말 고마워요. 덕분에 무사히 끝났어요!", [2, 1, 4, 0]],
  ["하린", null, "cheer", "이번 주 다들 너무 고생 많았어요. 금요일까지 조금만 더 힘내요 🔥", [3, 1, 0, 0]],
  ["수진", "현우", "praise", "오늘 발표 자료 구성이 정말 깔끔했어요. 질문 대응도 최고!", [1, 2, 1, 0]],
  ["도윤", null, "feedback", "PR 설명에 스크린샷을 같이 올려 주면 리뷰가 훨씬 빨라질 것 같아요.", [0, 0, 0, 2]],
  ["지호", "서연", "cheer", "첫 코드 리뷰 받느라 긴장했을 텐데 정말 잘했어요. 앞으로가 기대돼요!", [1, 1, 1, 0]],
  ["서연", "지영", "praise", "디자인 시안 정말 예뻐요. 색 조합 센스가 대단해요 ✨", [0, 1, 0, 0]],
];

/** 예전 시드(12개)에 쓰였던 작성자. 이전 시드를 지울 때 함께 찾는다(예전에는 "익명"도 있었다). */
const LEGACY_SEED_AUTHORS = ["민수", "하린", "수진", "도윤", "지호", "지영", "현우", "서연", "유나", "익명"];

const visitor = (n: number) => `5eed0000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const sql = getSql();

// 이전 시드 지우기: 시드 전용 비밀번호로 만든 Kudo는 모두 시드다. Reaction은 연쇄 삭제된다.
const seedAuthors = [...new Set([...KUDOS.map((k) => k[0]), ...LEGACY_SEED_AUTHORS])];
const existing = (await sql`select id, password_hash from kudos where author = any(${seedAuthors})`) as {
  id: number;
  password_hash: string;
}[];
const seedIds: number[] = [];
for (const row of existing) if (await verifyPassword(SEED_PASSWORD, row.password_hash)) seedIds.push(row.id);
if (seedIds.length) await sql`delete from kudos where id = any(${seedIds})`;

let reactions = 0;
for (const [author, recipient, category, message, counts] of KUDOS) {
  const [{ id }] = (await sql`
    insert into kudos (author, recipient, category, message, password_hash)
    values (${author}, ${recipient}, ${category}, ${message}, ${await hashPassword(SEED_PASSWORD)})
    returning id`) as { id: number }[];
  for (const [i, emoji] of EMOJIS.entries()) {
    for (let v = 0; v < counts[i]; v++) {
      await sql`insert into reactions (kudo_id, emoji, visitor_id) values (${id}, ${emoji}, ${visitor(v)}::uuid)`;
      reactions++;
    }
  }
}
console.log(`시드 완료: 이전 시드 ${seedIds.length}개 삭제, Kudo ${KUDOS.length}개와 Reaction ${reactions}개 추가 (비밀번호: ${SEED_PASSWORD})`);
