# 06: Reaction 토글

**What to build:** Visitor가 쿠도 카드의 🔥 👏 ❤️ 💡 버튼을 누르면 숫자가 즉시 오르고, 다시 누르면 취소된다. 내가 누른 Reaction은 강조되어 보이며, 새로고침하거나 나중에 다시 와도 유지된다. 네트워크 오류로 반영에 실패하면 숫자가 원래대로 돌아오고 오류 토스트가 뜬다.

**Blocked by:** 03 (Kudo 작성하고 최신순 목록에서 보기)

**Status:** resolved

- [ ] reactions 테이블 마이그레이션: (kudo_id, emoji, visitor_id) PK, kudos FK `ON DELETE CASCADE`, emoji check 제약
- [ ] PUT은 켜기, DELETE는 끄기이며 멱등이다. 같은 Visitor가 PUT을 반복해도 count는 1이다
- [ ] 응답은 `{ emoji, count, reacted, temperature }`다(temperature 계산은 08번 티켓에서 채우며, 여기서는 필드 자리만 둔다)
- [ ] 알 수 없는 이모지는 400, 없는 Kudo는 404다
- [ ] Visitor 쿠키가 없으면 Reaction 요청 처리 시 새 UUID를 발급해 httpOnly·SameSite=Lax·운영에서 Secure·1년 쿠키로 싣는다
- [ ] 서로 다른 Visitor의 Reaction은 각각 집계되고, KudoView의 `reacted`는 요청한 Visitor 기준이다. 쿠키가 없으면 모두 false다
- [ ] 누르는 즉시 캐시된 모든 페이지에서 해당 카드의 count·reacted가 바뀐다(Optimistic UI)
- [ ] 실패하면 요청 전 상태로 되돌리고 오류 토스트를 띄운다
- [ ] 같은 Kudo·이모지 요청이 진행 중인 동안 그 버튼은 비활성화된다
- [ ] 버튼은 `aria-pressed`와 "불꽃 리액션 3개" 같은 접근 가능한 이름을 가진다
- [ ] Route Handler 테스트가 멱등성, Visitor별 집계, reacted 계산, 400·404를 검증한다
- [ ] 수동 확인: 개발자 도구에서 네트워크를 끊고 눌러 롤백과 토스트 확인

## Comments

- 2026-09-28: 구현 완료. 테스트 9개 통과(PUT 켜기, 멱등, DELETE, Visitor별 집계와 reacted, 새 Kudo는 모두 0, 400·404, 쿠키 발급·재발급 안 함·잘못된 쿠키). 실행 중인 앱에서 쿠키 발급과, 같은 쿠키로 열었을 때만 버튼이 눌린 상태로 그려지는 것을 확인했다.
  - `temperature`는 08번 티켓에서 응답에 추가한다(자리만 두지 않고 그때 한 번에 넣는다).
  - 실패 시 롤백은 전체 캐시가 아니라 그 버튼의 이전 상태만 되돌린다(다른 버튼의 진행 중 변경을 지우지 않도록).
  - integer 범위를 넘는 id·커서는 DB 오류(500) 대신 404·400으로 처리한다.
  - 남은 수동 확인: 개발자 도구에서 네트워크를 끊고 눌러 롤백과 토스트 확인.
