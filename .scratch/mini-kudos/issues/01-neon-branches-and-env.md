# 01: Neon 브랜치와 환경 변수 준비

**What to build:** 로컬 개발, 자동 테스트, 운영이 서로 다른 Neon 브랜치를 쓰도록 준비한다. 개발자가 앱을 띄우면 dev 브랜치에, 테스트를 돌리면 test 브랜치에 연결되고, 운영(main) 브랜치의 데이터는 개발·테스트로 오염되지 않는다.

**Blocked by:** None (can start immediately)

**Status:** resolved

사람이 해야 하는 단계는 Neon 로그인 한 번이다(`! npx neonctl auth`). 로그인 뒤 브랜치 생성과 환경 파일 작성은 에이전트가 진행한다.

- [ ] 현재 로컬 환경 파일의 `DATABASE_URL`이 어느 Neon 브랜치인지 확인해 기록한다
- [ ] Neon 프로젝트에 main(운영), dev(로컬 개발), test(테스트) 브랜치가 존재한다
- [ ] 로컬 환경 파일의 `DATABASE_URL`은 dev 브랜치의 풀링 연결 문자열(`sslmode=require` 포함)이다
- [ ] 테스트 전용 환경 파일이 따로 있고, test 브랜치 연결 문자열을 담는다
- [ ] 두 환경 파일 모두 git에 올라가지 않는다(`git status`에 나타나지 않음)
- [ ] 운영 브랜치 연결 문자열은 저장소 어디에도 적지 않는다(13번 티켓에서 Vercel에만 등록)

## Comments

- 2026-09-28: 브랜치 분리 대신 **같은 브랜치 안의 DB 분리**로 결정했다(사용자 승인). Neon CLI 로그인 없이 기존 연결로 진행할 수 있기 때문이다.
  - 기존 `DATABASE_URL`은 프로젝트 `lingering-dawn-30810643`, 브랜치 `br-raspy-scene-azvenyzg`의 `neondb`였고 테이블이 없었다. 이것을 운영 DB로 쓰고 `.env.prod`로 옮겼다.
  - `neondb_dev`(로컬 개발, `.env.local`)와 `neondb_test`(테스트, `.env.test`)를 새로 만들었다.
  - 세 파일 모두 git에서 제외됨을 확인했다. 위 체크리스트의 "브랜치" 항목은 이 DB 분리로 대체한다.
