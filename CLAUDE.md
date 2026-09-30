# CLAUDE.md

이 파일은 이 저장소에서 작업하는 Claude Code(claude.ai/code)에게 주는 안내입니다.

@AGENTS.md

## 스택과 아키텍처

- **Next.js 16:** 이전 버전과 다르므로 기억에 의존하지 말고 `node_modules/next/dist/docs/`(`01-app/`, `03-architecture/` 등)에 번들된 문서를 먼저 확인하세요. 예: `app/layout.tsx`는 props 타입을 직접 쓰지 않고 전역 헬퍼 `LayoutProps<"/">`를 씁니다.
- **데이터베이스:** Neon은 서버 코드(Server Component, Route Handler, Server Action)에서만 쿼리하고 클라이언트 컴포넌트에서는 절대 쿼리하지 마세요. SQL은 Kudo 모듈 한곳에만 둡니다(예외는 ADR 0001 참고).
- **라우트 구조:** 보드 페이지와 로딩 화면은 `app/(board)/` 라우트 그룹에 있습니다. 로딩 화면(`loading.tsx`)을 루트로 옮기지 마세요. 모든 페이지가 스트리밍 응답이 되어, 없는 Kudo(`/k/{id}`)가 HTTP 404 대신 200을 돌려주게 됩니다.

## DB 환경과 명령

같은 Neon 브랜치 안에서 데이터베이스를 나눠 씁니다. 세 환경 파일 모두 git에서 제외됩니다.

| 환경 파일 | DB | 용도 |
|---|---|---|
| `.env.local` | `neondb_dev` | 로컬 개발(`npm run dev`, `npm run db:migrate`, `npm run db:seed`) |
| `.env.test` | `neondb_test` | 자동 테스트 전용 |
| `.env.prod` | `neondb` | 운영(Vercel). Next.js가 자동으로 읽지 않는 파일명이라 명령에 직접 지정해야 합니다 |

- **테스트는 매번 테이블을 비웁니다.** `npm test`는 `.env.test`만 읽고, 시작할 때 테스트 DB에 마이그레이션을 적용한 뒤 테스트마다 앱 테이블을 모두 지웁니다. `.env.test`가 없거나 `.env.local`과 같은 DB를 가리키면 시작 전에 멈춥니다. 이 안전장치를 우회하지 마세요.
- **테스트는 원격 DB를 실제로 씁니다.** 그래서 파일은 순차 실행하고 제한 시간을 30초로 둡니다. 예외로 요청 횟수 제한 테스트는 한도(1분 30회)만큼 요청을 보내고 분 경계를 기다리기도 해서 테스트별로 90초를 둡니다. 파일 하나만 돌릴 때는 `npx vitest run test/<파일>.test.ts`를 씁니다.
- **스키마 변경**은 `db/migrations/`에 다음 번호의 `.sql` 파일을 새로 추가합니다. 이미 적용된 마이그레이션 파일은 고치지 마세요(적용 이력은 파일 이름으로 판단합니다).
- **운영 DB 작업**은 환경 파일을 직접 지정합니다: `node --env-file=.env.prod scripts/migrate.mts`. 운영 데이터가 바뀌므로 사용자에게 확인한 뒤에만 실행합니다.
- **시드**(`npm run db:seed`)는 시드 전용 비밀번호로 만든 Kudo만 지우고 다시 넣으므로, 직접 작성한 Kudo는 남습니다.

## 에이전트 스킬

`mattpocock/skills`의 스킬이 `.agents/skills/`에 설치되어 있고 `skills-lock.json`으로 버전이 고정되어 있습니다. Claude Code가 인식하도록 `.claude/skills`가 `.agents/skills`를 가리키는 심볼릭 링크로 연결되어 있습니다.

이 과제에서 쓰는 8개 스킬(`grill-with-docs`, `grilling`, `domain-modeling`, `to-spec`, `to-tickets`, `implement`, `code-review`, `tdd`)은 한국어로 번역해 두었습니다. 그래서 `skills-lock.json`의 해시와 일치하지 않으며, 스킬을 업데이트하면 영어 원문으로 덮어써집니다. 나머지 스킬은 원문 그대로입니다.

### 이슈 트래커

이슈는 `.scratch/<feature>/` 아래의 로컬 마크다운 파일로 관리합니다. `docs/agents/issue-tracker.md`를 참고하세요.

### 트리아지 라벨

기본 라벨 어휘(`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`)를 씁니다. `docs/agents/triage-labels.md`를 참고하세요.

### 도메인 문서

단일 컨텍스트 구조입니다. 저장소 루트에 `CONTEXT.md` 하나와 `docs/adr/`가 있습니다. `docs/agents/domain.md`를 참고하세요.

## 문서 작성 규칙

설명을 담는 문서(CLAUDE.md, 스펙, 티켓, ADR, `CONTEXT.md`, README, `docs/` 아래 문서 등)는 모두 한국어로 작성합니다. 코드 식별자, 명령어, 라벨 문자열처럼 그대로 입력해야 하는 값은 원문을 유지합니다.
