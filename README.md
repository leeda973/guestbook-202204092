# Mini Kudos (미니 쿠도스)

> 가볍게 전하는 응원, 함께 따뜻해지는 공간

팀원과 동료에게 응원·피드백·감사·칭찬 카드(**Kudo**)를 가입 없이 남기고, 🔥 👏 ❤️ 💡 리액션으로 온기를 더하는 모던 미니 방명록입니다. Kudo마다 받은 리액션만큼 **쿠도 온도**가 오르고, 헤더에는 보드 전체의 **보드 온도**가 표시됩니다.

- 개발자: **이다은 (202204092)**
- 배포 URL: https://guestbook-202204092.vercel.app
- 저장소·Vercel 프로젝트·Neon 프로젝트 이름: `guestbook-202204092`

## 주요 기능

- **Kudo 작성**: 이름(필수), 받는 사람(선택), 카테고리, 메시지(보이는 글자 기준 최대 200자), 수정·삭제용 비밀번호. 모바일은 바텀 시트, 데스크톱은 모달로 열립니다.
- **조회**: 최신 작성 순으로 모든 Kudo를 보며, Kudo마다 이름·메시지와 작성 시각("3분 전 · 9월 30일 14:05", 한국 시간)이 함께 표시됩니다.
- **수정·삭제**: 작성할 때 정한 비밀번호가 맞을 때만 메시지를 수정하거나 Kudo를 삭제합니다. 비밀번호가 틀리면 거부되고, "비밀번호가 일치하지 않습니다"가 토스트와 비밀번호 칸 아래에 함께 표시됩니다. 비밀번호는 해시로만 저장하고 어떤 응답에도 포함하지 않습니다.
- **둘러보기**: 카테고리 필터, 메시지·이름 검색, 최신순·인기순 탭, 20개씩 무한 스크롤. 카드는 왼쪽→오른쪽 순서의 메이슨리로 놓여 인기순 1·2·3위가 첫 줄에 나란히 보입니다. 필터 상태는 주소에 남아 새로고침·공유해도 유지됩니다.
- **리액션**: 누르는 즉시 반영(Optimistic UI)하고, 실패하면 이전 상태로 되돌린 뒤 알려줍니다. 브라우저마다 이모지별로 한 번씩 켜고 끌 수 있습니다.
- **공유와 Kudo Page**: 카드의 공유 버튼으로 Kudo 한 장만 보여주는 주소(`/k/123`)를 보냅니다. 모바일은 시스템 공유 창, 데스크톱은 링크 복사입니다. 메신저 미리보기에는 그 카드 모양의 이미지(카테고리 색, 메시지, To·From, 온도)가 뜨고, 보드 메인 주소에도 로고·슬로건·보드 온도가 담긴 기본 이미지가 뜹니다.
- **받는 사람 모아보기**: 카드의 "To. 이름"을 누르면 그 사람이 받은 Kudo만 모아 봅니다(`/?to=이름`). 앞뒤 공백·대소문자만 다른 이름은 같은 사람으로 봅니다.
- **이번 주 가장 따뜻한 동료**: 최근 7일 동안 받은 Kudo와 리액션으로 정한 **동료 온도** Top 3를 목록 위에 보여줍니다. 누르면 그 사람 모아보기로 바뀝니다.
- **안정성**: 빈 화면·결과 없음 안내, 로딩 스켈레톤, 다시 시도, 한국어 404·오류 화면, 작성과 비밀번호 확인의 요청 횟수 제한(IP당 1분 30회), 다크 모드.

## 기술 스택

- Next.js 16 (App Router, Route Handlers, `opengraph-image`), React 19, TypeScript
- Neon Postgres (`@neondatabase/serverless` HTTP 드라이버, ORM 없이 SQL 직접 사용 — [ADR 0001](docs/adr/0001-raw-sql-with-neon-serverless-driver.md))
- TanStack Query, Zod(클라이언트·서버 공용 검증)
- Tailwind CSS v4, shadcn/ui(Radix), lucide-react, sonner, next-themes
- Vitest (실제 테스트 DB를 쓰는 API 통합 테스트)
- Vercel 배포

## 로컬에서 실행하기

필요한 것: Node.js 22 이상, Neon 프로젝트 하나.

1. 의존성 설치

   ```bash
   npm install
   ```

2. 환경 파일 준비. 같은 Neon 브랜치 안에 개발용·테스트용 DB를 따로 만들어 씁니다(모두 git에서 제외됨).

   | 파일 | 용도 | 내용 |
   |---|---|---|
   | `.env.local` | 로컬 개발 | `DATABASE_URL=` 개발 DB(`neondb_dev`) 연결 문자열 |
   | `.env.test` | 자동 테스트 | `DATABASE_URL=` 테스트 DB(`neondb_test`) 연결 문자열 |
   | `.env.prod` | 운영 작업용 | `DATABASE_URL=` 운영 DB(`neondb`) 연결 문자열. Next.js가 자동으로 읽지 않습니다 |

   테스트는 매번 테이블을 비우므로, `.env.test`가 없거나 `.env.local`과 같은 DB를 가리키면 시작 전에 멈춥니다.

3. 스키마 적용과 예시 데이터

   ```bash
   npm run db:migrate   # db/migrations/의 SQL 중 적용 안 된 것만 순서대로 적용
   npm run db:seed      # 예시 Kudo 6개와 리액션 (다시 실행해도 중복되지 않음)
   ```

4. 개발 서버

   ```bash
   npm run dev          # http://localhost:3000
   ```

## 테스트와 검사

```bash
npm test             # 전체 테스트 (테스트 DB에 마이그레이션을 적용한 뒤 실행)
npx vitest run test/reactions.test.ts   # 파일 하나만
npm run lint
npm run build
```

테스트는 Route Handler에 실제 `Request`를 넣어 응답을 확인하는 방식으로, 내부 구현이 아니라 API의 겉 동작을 검증합니다. 온도 공식만 순수 함수 단위 테스트로 따로 확인합니다.

## 개발 과정

Claude Code와 [Matt Pocock 스킬](https://github.com/mattpocock/skills)로 기획부터 구현까지 진행했습니다. 과정의 산출물은 모두 저장소에 남아 있습니다.

1. **`/grill-with-docs`**: 질문 라운드로 기획을 구체화하며 용어집 [`CONTEXT.md`](CONTEXT.md)와 [ADR](docs/adr/)을 작성
2. **`/to-spec`**: 합의 내용을 스펙 [`.scratch/mini-kudos/spec.md`](.scratch/mini-kudos/spec.md)로 정리
3. **`/to-tickets`**: 스펙을 수직 조각 티켓 13개 [`.scratch/mini-kudos/issues/`](.scratch/mini-kudos/issues/)로 분할
4. **`/implement`**: 티켓마다 테스트를 먼저 쓰고 구현한 뒤 티켓 단위로 커밋 (각 티켓 파일의 Comments에 결과 기록)
5. **`/code-review`**: 표준·스펙 두 축으로 변경 리뷰하고 지적 사항을 반영

## 프로젝트 구조

- `app/` 페이지(`(board)/` 보드, `k/[id]/` Kudo Page)와 Route Handler(`app/api/`), 미리보기 이미지(`opengraph-image`)
- `lib/kudos.ts` Kudo 유스케이스와 SQL을 가진 모듈, `lib/kudo-schema.ts` 공용 도메인 정의·검증
- `components/` UI, `components/ui/` shadcn/ui 컴포넌트
- `db/migrations/` 번호 붙은 SQL 마이그레이션, `scripts/` 마이그레이션·시드 스크립트
- `test/` API 통합 테스트
