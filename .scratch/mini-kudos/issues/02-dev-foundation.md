# 02: 개발 기반: 테스트·마이그레이션·앱 뼈대

**What to build:** 이후 모든 티켓이 테스트를 먼저 쓰고 구현할 수 있는 기반을 만든다. 개발자는 명령 하나로 테스트 DB에 연결된 테스트를 돌리고, 명령 하나로 스키마 마이그레이션을 적용한다. 앱을 열면 한국어 레이아웃에 서비스명·슬로건이 있는 헤더가 보이고, 다크 모드 전환이 동작한다. 이 티켓은 이후 조각을 쉽게 만들기 위한 선행 작업이다.

**Blocked by:** 01 (Neon 브랜치와 환경 변수 준비)

**Status:** resolved

- [ ] Vitest(Node 환경)가 설정되어 `npm test`가 test 브랜치에 연결되는 기본 테스트 하나를 통과한다
- [ ] 테스트 파일은 순차 실행되고, 각 테스트 전에 테이블을 비우는 공통 준비 단계가 있다
- [ ] `npm run db:migrate`가 번호 붙은 SQL 마이그레이션 중 미적용분만 순서대로 적용하고 적용 이력을 기록한다. 두 번 실행해도 안전하다
- [ ] DB 접근은 Neon 서버리스 HTTP 드라이버 하나로 하며, 서버 코드에서만 import된다(ADR 0001)
- [ ] 모든 Route Handler가 공유할 오류 변환이 있어, `HttpError`와 검증 실패를 스펙의 실패 응답 형태 `{ error: { code, message, fieldErrors? } }`로 바꾼다
- [ ] 레이아웃이 `lang="ko"`이고 제목은 "Mini Kudos", 설명은 슬로건이다
- [ ] 헤더에 서비스명, 슬로건, 테마 전환 버튼이 있다. 기본 테마는 시스템 설정을 따른다
- [ ] shadcn/ui, lucide-react, sonner 토스트, TanStack Query 공급자가 연결되어 있다
- [ ] Category 색(응원 주황, 피드백 파랑, 감사 초록, 칭찬 분홍)과 다크 모드 톤이 CSS 변수 토큰으로 정의되어 있다
- [ ] `npm run build`와 `npm run lint`가 통과한다
- [ ] 수동 확인: 라이트·다크 모드 전환과 새로고침 후 유지

## Comments

- 2026-09-28: DB가 필요 없는 부분을 먼저 구현했다. 앱 뼈대(한국어 레이아웃, 헤더, 테마 전환), shadcn/ui·TanStack Query·sonner 연결, Category·온도 색 토큰, 공통 오류 변환(`handle`, `HttpError`)과 그 테스트 4개, 마이그레이션 러너, Vitest 설정이다. `npm run lint`와 `npm run build`는 통과한다. 남은 것은 01번 티켓의 `.env.test` 준비 후 DB 테스트 통과 확인과 마이그레이션 실행 확인이다. `.env.test`가 없거나 `.env.local`과 같은 DB를 가리키면 테스트가 시작 전에 멈춘다.
- 2026-09-28: `.env.test` 준비 후 `npm test` 5개 모두 통과(DB 연결 포함). `npm run db:migrate`를 두 번 실행해도 안전함을 확인했다. 티켓 완료.
