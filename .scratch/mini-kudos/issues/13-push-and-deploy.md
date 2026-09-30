# 13: GitHub push와 Vercel 배포

**What to build:** 저장소가 GitHub에 올라가고 Vercel에 배포되어, 누구나 배포 URL에서 Mini Kudos를 쓸 수 있다. 제출물인 GitHub 저장소 URL과 배포 URL이 확정된다.

**Blocked by:** 12 (시드 데이터와 배포 준비)

**Status:** ready-for-human

사람이 해야 하는 단계는 Vercel 로그인 한 번이다(`! npx vercel login`). GitHub push와 Vercel 배포는 외부에 공개되는 작업이므로, 에이전트는 실행 직전에 확인을 받는다. 로그인 뒤 나머지는 에이전트가 진행한다.

- [ ] 이미 연결된 GitHub 원격 저장소에 main 브랜치가 push되어 있다
- [ ] Vercel 프로젝트가 GitHub 저장소와 연결되어 있다
- [ ] Vercel 환경 변수에 운영 DB(`.env.prod`의 `DATABASE_URL`, `neondb`)가 Production 환경으로 등록되어 있다
- [ ] 운영 DB에 마이그레이션이 적용되어 있고, 시드 투입 여부를 결정해 반영했다
- [ ] 배포 URL에서 작성, 리액션, 필터·검색, 정렬, 수정, 삭제가 동작한다
- [ ] README에 배포 URL이 적혀 있다
- [ ] 제출용 GitHub 저장소 URL과 배포 URL을 사용자에게 전달했다

## Comments

- 2026-09-30: 배포는 사용자가 직접 하기로 했다. 과제 제출 규칙(이름 `guestbook-202204092`, public, 운영 DB 마이그레이션, 환경 변수, 배포 후 CRUD 확인)을 반영한 점검표를 README의 "제출 점검표"와 v3 스펙 추가 메모에 정리했다.
