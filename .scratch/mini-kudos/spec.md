# Mini Kudos 스펙

Status: ready-for-agent

> "가볍게 전하는 응원, 함께 따뜻해지는 공간"
> 용어는 루트의 `CONTEXT.md`를 따른다. DB 접근 방식은 ADR 0001을 따른다.

## 문제 정의 (Problem Statement)

팀원과 동료에게 "고마워요", "오늘 발표 좋았어요" 같은 짧은 응원이나 피드백을 전하고 싶지만, 메신저에 남기기엔 흘러가 버리고 따로 글을 쓰기엔 부담스럽다. 가입 없이 누구나 바로 한마디를 남기고, 다른 사람이 남긴 응원에 가볍게 공감을 더할 수 있는 한곳이 없다. 또 그런 온기가 얼마나 쌓였는지 눈에 보이지 않아 서로 응원하는 문화가 지속되기 어렵다.

## 해결 방안 (Solution)

하나의 공용 **Board**에 누구나 로그인 없이 **Kudo**(쿠도 카드)를 남긴다. Kudo에는 **Author**(기본 "익명"), 선택적인 **Recipient**, **Category**(응원·피드백·감사·칭찬), **Message**(최대 200자)를 담고, 작성 시 정한 비밀번호로 나중에 수정·삭제한다. 다른 **Visitor**는 🔥 👏 ❤️ 💡 **Reaction**을 켜고 끌 수 있으며, 반응은 즉시 화면에 반영된다. 각 Kudo는 받은 리액션만큼 **Kudo Temperature**가 오르고, Board 전체의 활동은 헤더의 **Board Temperature**로 표시되어 "우리가 얼마나 따뜻해졌는지"를 보여준다. 카테고리 필터, 검색, 최신순/인기순 정렬, 무한 스크롤로 쌓인 Kudo를 쉽게 둘러볼 수 있다. 모바일 우선 반응형이며 다크 모드를 지원하고, UI는 한국어로만 제공한다.

## 사용자 스토리 (User Stories)

### Kudo 둘러보기

1. Visitor로서, 첫 화면에서 가장 최근 Kudo들을 카드 형태로 보고 싶다, 그래야 동료들이 어떤 응원을 주고받는지 바로 알 수 있다.
2. Visitor로서, 각 Kudo 카드에서 Author, Recipient, Category, Message, 작성 시각을 한눈에 보고 싶다, 그래야 누가 누구에게 어떤 마음을 전했는지 이해할 수 있다.
3. Visitor로서, 작성 시각을 "3분 전", "어제"처럼 상대 시간으로 보고 싶다, 그래야 얼마나 최근 이야기인지 직관적으로 알 수 있다.
4. Visitor로서, Category마다 다른 색의 카드를 보고 싶다, 그래야 응원·피드백·감사·칭찬을 색만으로도 구분할 수 있다.
5. Visitor로서, Recipient가 없는 Kudo는 받는 사람 표시 없이 보고 싶다, 그래야 Board 전체에 남긴 Kudo임을 알 수 있다.
6. Visitor로서, 수정된 Kudo에는 "(수정됨)" 표시를 보고 싶다, 그래야 원래 내용이 바뀌었다는 사실을 알 수 있다.
7. Visitor로서, 스크롤을 내리면 다음 Kudo들이 자동으로 이어서 불러와지길 원한다, 그래야 버튼을 누르지 않고 계속 읽을 수 있다.
8. Visitor로서, 더 불러올 Kudo가 없을 때 끝에 도달했다는 표시를 보고 싶다, 그래야 로딩이 멈춘 것인지 끝난 것인지 헷갈리지 않는다.
9. Visitor로서, 목록을 불러오는 동안 카드 모양의 스켈레톤을 보고 싶다, 그래야 화면이 멈춘 것이 아니라 로딩 중임을 알 수 있다.
10. Visitor로서, 목록을 불러오지 못했을 때 오류 안내와 "다시 시도" 버튼을 보고 싶다, 그래야 새로고침 없이 복구할 수 있다.
11. Visitor로서, Board에 Kudo가 하나도 없을 때 "첫 번째 응원 메시지를 남겨보세요! 🎉" 안내와 작성 버튼을 보고 싶다, 그래야 빈 화면에서 무엇을 해야 할지 안다.

### 필터·검색·정렬

12. Visitor로서, 전체·응원·피드백·감사·칭찬 중 하나를 골라 Kudo를 걸러보고 싶다, 그래야 원하는 성격의 Kudo만 모아볼 수 있다.
13. Visitor로서, 키워드로 Message, Author, Recipient를 한꺼번에 검색하고 싶다, 그래야 특정 사람이나 내용이 담긴 Kudo를 찾을 수 있다.
14. Visitor로서, 검색어를 입력하는 동안 결과가 잠시 뒤 자동으로 갱신되길 원한다, 그래야 엔터를 누르지 않아도 되고 입력할 때마다 화면이 깜빡이지 않는다.
15. Visitor로서, 대소문자와 상관없이 검색되길 원한다, 그래야 영문 이름을 정확히 입력하지 않아도 찾을 수 있다.
16. Visitor로서, 검색어에 `%`나 `_` 같은 문자가 들어가도 글자 그대로 검색되길 원한다, 그래야 예상치 못한 결과가 나오지 않는다.
17. Visitor로서, 최신순과 인기순 탭을 전환하고 싶다, 그래야 새 소식과 가장 공감받은 Kudo를 각각 볼 수 있다.
18. Visitor로서, 인기순에서 리액션 합계가 같은 Kudo들도 매번 같은 순서로 보이길 원한다, 그래야 스크롤할 때 카드가 중복되거나 빠지지 않는다.
19. Visitor로서, 필터·검색어·정렬 상태가 주소창에 반영되길 원한다, 그래야 새로고침하거나 링크를 공유해도 같은 화면을 볼 수 있다.
20. Visitor로서, 필터나 검색 결과가 없을 때 "조건에 맞는 Kudo가 없어요" 안내와 "필터 초기화" 버튼을 보고 싶다, 그래야 Board가 빈 것과 결과가 없는 것을 구분하고 바로 되돌아갈 수 있다.

### Kudo 작성

21. Visitor로서, 화면 구석의 떠 있는 버튼으로 언제든 작성 창을 열고 싶다, 그래야 스크롤 위치와 상관없이 바로 Kudo를 남길 수 있다.
22. 모바일 Visitor로서, 작성 창이 아래에서 올라오는 시트로 열리길 원한다, 그래야 한 손으로 편하게 입력할 수 있다.
23. 데스크톱 Visitor로서, 작성 창이 화면 가운데 모달로 열리길 원한다, 그래야 넓은 화면에 맞게 입력할 수 있다.
24. Author로서, 이름을 비워두면 "익명"으로 남기고 싶다, 그래야 부담 없이 응원할 수 있다.
25. Author로서, Recipient를 선택적으로 적고 싶다, 그래야 특정 동료에게 전하는 Kudo임을 드러낼 수 있다.
26. Author로서, Category를 하나 반드시 골라야 하길 원한다, 그래야 내 Kudo가 알맞은 필터에 나타난다.
27. Author로서, Message를 입력하는 동안 "37/200" 같은 글자 수 카운터를 보고 싶다, 그래야 제한을 넘기기 전에 분량을 조절할 수 있다.
28. Author로서, 200자를 넘게 입력할 수 없길 원한다, 그래야 제출 후에야 오류를 알게 되는 일이 없다.
29. Author로서, 공백만 입력한 Message는 제출되지 않길 원한다, 그래야 빈 Kudo가 실수로 올라가지 않는다.
30. Author로서, 이름·Recipient·Message의 앞뒤 공백이 자동으로 정리되길 원한다, 그래야 표시가 깔끔하다.
31. Author로서, 수정·삭제용 비밀번호(4~20자)를 정하고 싶다, 그래야 나만 내 Kudo를 고치거나 지울 수 있다.
32. Author로서, 작성 창에서 "비밀번호를 잊으면 수정·삭제할 수 없어요" 안내를 보고 싶다, 그래야 비밀번호를 신중히 정한다.
33. Author로서, 잘못 입력한 항목 옆에 한국어 오류 문구를 보고 싶다, 그래야 무엇을 고쳐야 하는지 바로 안다.
34. Author로서, 제출 중에는 버튼이 비활성화되길 원한다, 그래야 같은 Kudo가 두 번 올라가지 않는다.
35. Author로서, 작성에 성공하면 창이 닫히고 성공 토스트와 함께 내 Kudo가 목록 맨 위에 보이길 원한다, 그래야 잘 남겨졌음을 확신할 수 있다.
36. Author로서, 짧은 시간에 너무 많이 작성하면 "잠시 후 다시 시도해 주세요" 안내를 받고 싶다, 그래야 왜 실패했는지 안다.

### Kudo 수정·삭제

37. Author로서, 내 Kudo 카드의 메뉴에서 "수정"을 골라 작성할 때와 같은 폼으로 Message, Category, Recipient를 고치고 싶다, 그래야 오타나 내용을 바로잡을 수 있다.
38. Author로서, 수정할 때 비밀번호를 함께 입력하고 싶다, 그래야 다른 사람이 내 Kudo를 바꾸지 못한다.
39. Author로서, 수정 폼에서 Author와 비밀번호는 바뀌지 않길 원한다, 그래야 작성자 정보가 일관된다.
40. Author로서, 카드 메뉴에서 "삭제"를 고르면 비밀번호를 묻는 확인 창이 뜨길 원한다, 그래야 실수로 지우지 않는다.
41. Author로서, 비밀번호가 틀리면 "비밀번호가 일치하지 않습니다" 토스트를 보고 싶다, 그래야 다시 입력할 수 있다.
42. Author로서, 삭제에 성공하면 카드가 목록에서 바로 사라지길 원한다, 그래야 새로고침하지 않아도 결과를 확인할 수 있다.
43. Author로서, 이미 다른 곳에서 삭제된 Kudo를 수정·삭제하려 하면 "이미 삭제되었거나 없는 Kudo예요" 안내를 받고 싶다, 그래야 상황을 이해할 수 있다.
44. Visitor로서, 누군가 비밀번호를 계속 바꿔가며 시도하는 것이 제한되길 원한다, 그래야 내 Kudo가 무차별 대입으로 지워지지 않는다.

### Reaction

45. Visitor로서, Kudo 카드의 🔥 👏 ❤️ 💡 버튼으로 공감을 표시하고 싶다, 그래야 글을 쓰지 않고도 응원에 힘을 보탤 수 있다.
46. Visitor로서, 버튼을 누르자마자 숫자가 올라가길 원한다, 그래야 반응이 즉각적으로 느껴진다.
47. Visitor로서, 이미 누른 Reaction을 다시 누르면 취소되길 원한다, 그래야 잘못 누른 것을 되돌릴 수 있다.
48. Visitor로서, 내가 누른 Reaction은 강조된 모양으로 보이길 원한다, 그래야 내가 어디에 공감했는지 알 수 있다.
49. Visitor로서, 새로고침하거나 나중에 다시 와도 내가 누른 Reaction이 유지되길 원한다, 그래야 같은 Kudo에 중복으로 누르지 않는다.
50. Visitor로서, 같은 Reaction을 여러 번 눌러도 숫자가 한 번만 반영되길 원한다, 그래야 리액션 수가 공정하다.
51. Visitor로서, 네트워크 오류로 Reaction 반영에 실패하면 숫자가 원래대로 돌아오고 오류 토스트를 보고 싶다, 그래야 실제 상태와 화면이 어긋나지 않는다.
52. Visitor로서, 반영 중인 Reaction 버튼은 요청이 끝날 때까지 다시 눌리지 않길 원한다, 그래야 숫자가 엉키지 않는다.
53. 화면 낭독기를 쓰는 Visitor로서, 각 Reaction 버튼의 이름·개수·눌림 상태를 들을 수 있길 원한다, 그래야 시각 정보 없이도 리액션할 수 있다.

### 온도

54. Visitor로서, 각 Kudo 카드에서 Kudo Temperature 배지(예: 38.0°)를 보고 싶다, 그래야 그 Kudo가 얼마나 공감받았는지 알 수 있다.
55. Visitor로서, 헤더에서 Board Temperature(예: "우리 보드 온도 41.3°")를 보고 싶다, 그래야 Board 전체가 얼마나 따뜻해졌는지 느낄 수 있다.
56. Visitor로서, 온도 구간에 따라 배지 색이 초록→주황→빨강으로 바뀌길 원한다, 그래야 숫자를 읽지 않아도 온기를 가늠할 수 있다.
57. Visitor로서, 내가 Reaction을 누르면 해당 Kudo Temperature가 함께 바뀌길 원한다, 그래야 내 행동이 온기를 더했다는 것을 체감한다.
58. Visitor로서, Kudo를 작성하거나 Reaction을 누른 뒤 Board Temperature가 갱신되길 원한다, 그래야 헤더의 수치가 현재 상태를 반영한다.

### 화면 전반

59. 모바일 Visitor로서, 카드가 한 줄에 하나씩 보이길 원한다, 그래야 작은 화면에서도 읽기 편하다.
60. 태블릿·데스크톱 Visitor로서, 카드가 2~3열 메이슨리로 배치되길 원한다, 그래야 넓은 화면을 효율적으로 쓴다.
61. Visitor로서, 시스템 설정을 따라 다크 모드가 적용되고 직접 전환할 수도 있길 원한다, 그래야 어두운 환경에서도 눈이 편하다.
62. Visitor로서, 다크 모드에서도 Category 색이 구분되되 눈부시지 않길 원한다, 그래야 분위기가 유지된다.
63. 키보드 사용자로서, 필터·탭·버튼·작성 창·메뉴를 모두 키보드로 조작하고 싶다, 그래야 마우스 없이도 모든 기능을 쓸 수 있다.
64. Visitor로서, 링크를 메신저에 공유하면 서비스 이름과 슬로건이 미리보기에 나오길 원한다, 그래야 동료에게 소개하기 좋다.

### 운영

65. 운영자로서, 배포 직후 예시 Kudo와 Reaction을 시드 명령 하나로 채우고 싶다, 그래야 처음 방문한 사람도 기능을 바로 둘러볼 수 있다.
66. 운영자로서, 스키마 변경을 번호가 붙은 마이그레이션 명령 하나로 적용하고 싶다, 그래야 로컬·테스트·운영 DB를 같은 구조로 맞출 수 있다.
67. 운영자로서, 비밀번호가 DB에 해시로만 저장되고 어떤 API 응답에도 포함되지 않길 원한다, 그래야 DB나 응답이 노출되어도 비밀번호가 새지 않는다.
68. 운영자로서, 서버리스 환경에서 요청이 몰려도 DB 연결 수 초과가 생기지 않길 원한다, 그래야 서비스가 안정적이다.

## 구현 결정 (Implementation Decisions)

### 아키텍처와 모듈

- Next.js 16 App Router + TypeScript(strict). `any`를 쓰지 않는다. 구현 전 Next.js 패키지에 번들된 문서에서 Route Handler, `searchParams`, 쿠키 관련 현재 API를 확인한다.
- 서버 쪽은 두 계층이다. 바깥 계층은 바로 안쪽 계층만 호출한다.
  - **HTTP 계층 (Route Handler)**: 요청 파싱, Visitor 쿠키 읽기·발급, IP 추출, 응답 직렬화만 담당한다. 비즈니스 규칙을 두지 않는다. 모든 Route Handler는 공통 오류 변환 하나를 거쳐, 아래의 `HttpError`와 검증 실패를 실패 응답 형태로 바꾼다.
  - **Kudo 모듈**: 유스케이스 단위의 깊은 모듈. `listKudos`, `createKudo`, `updateKudo`, `deleteKudo`, `setReaction`, `getBoardStats`를 제공한다. 입력 검증, 비밀번호 해시·확인, 요청 횟수 제한, 온도 계산 결합, 그리고 Kudo·Reaction SQL을 모두 이 모듈이 가진다(ADR 0001). 요청 횟수 제한의 SQL만 예외로 전용 모듈에 두고, Kudo 모듈은 그 함수를 호출한다. DB 행은 이 모듈 안에서 도메인 타입으로 변환되며 밖으로 새지 않는다. 실패는 상태 코드·`code`·한국어 `message`를 담은 `HttpError` 하나를 던져 알린다.
  - **도메인**: Category·Reaction 이모지 목록, 입력 검증 Zod 스키마, 온도 계산 순수 함수, 커서 인코딩/디코딩. 클라이언트와 서버가 함께 import한다.
  - **클라이언트**: TanStack Query 기반 데이터 훅(목록 무한 조회, 작성·수정·삭제, Reaction 토글, Board 통계)과 UI 컴포넌트.
- 첫 화면은 Server Component가 `searchParams`와 Visitor 쿠키를 읽어 Kudo 서비스를 직접 호출하고, 그 결과를 TanStack Query 초기 데이터로 하이드레이션한다. 이후 모든 읽기·쓰기는 Route Handler를 거친다. Server Actions는 쓰지 않는다.

### DB 스키마 (Neon Postgres)

- **kudos**
  - `id`: integer identity, PK
  - `author`: text, not null, 기본값 "익명", 1~20자
  - `recipient`: text, null 허용, 1~20자
  - `category`: text, not null, `cheer | feedback | thanks | praise` 중 하나(check 제약). 화면 라벨은 응원·피드백·감사·칭찬
  - `message`: text, not null, 1~200자(check 제약)
  - `password_hash`: text, not null
  - `created_at`: timestamptz, not null, 기본값 now()
  - `updated_at`: timestamptz, null 허용. 수정 시에만 채워지며 "(수정됨)" 판단 근거
- **reactions**
  - `kudo_id`: integer, kudos FK, `ON DELETE CASCADE`
  - `emoji`: text, `fire | clap | heart | bulb` 중 하나(check 제약). 각각 🔥 👏 ❤️ 💡
  - `visitor_id`: uuid, not null
  - `created_at`: timestamptz, 기본값 now()
  - PK: (kudo_id, emoji, visitor_id) — 같은 Visitor의 중복 Reaction을 DB가 막는다
- **rate_limits**
  - `key`: text (예: 행위 종류 + IP), `window_start`: timestamptz, `count`: int
  - PK: (key, window_start). 1분 고정 윈도로 upsert하여 증가시키고, 오래된 행은 같은 쿼리 흐름에서 정리한다.
- **schema_migrations**: 적용된 마이그레이션 이름과 시각. 마이그레이션 스크립트가 미적용 파일만 순서대로 실행한다.
- Kudo 삭제는 하드 삭제다.

### API 계약

모든 응답은 JSON이며, 실패 응답은 `{ error: { code, message, fieldErrors? } }` 형태다. `message`는 화면에 그대로 띄울 수 있는 한국어 문장이다. `code`는 `VALIDATION_FAILED | INVALID_PASSWORD | NOT_FOUND | RATE_LIMITED | INTERNAL`.

- **GET 목록** `/api/kudos`
  - 쿼리: `category`(생략 시 전체), `q`(검색어, trim 후 빈 값이면 무시), `sort=latest|popular`(기본 latest), `cursor`(이전 응답의 `nextCursor`). 페이지 크기는 20으로 고정한다
  - 응답 200: `{ items: KudoView[], nextCursor: string | null }`
  - 잘못된 파라미터·커서는 400
- **POST 작성** `/api/kudos`
  - 본문: `{ author?, recipient?, category, message, password }`
  - 응답 201: `KudoView` / 400 / 429
- **PATCH 수정** `/api/kudos/{id}`
  - 본문: `{ password, category, message, recipient? }` (Author·비밀번호는 변경 불가)
  - 응답 200: `KudoView` / 400 / 403 `INVALID_PASSWORD` / 404 / 429
- **DELETE 삭제** `/api/kudos/{id}`
  - 본문: `{ password }`
  - 응답 204 / 403 / 404 / 429
- **Reaction 켜기·끄기** `/api/kudos/{id}/reactions/{emoji}` — PUT은 켜기, DELETE는 끄기
  - 토글이 아니라 목표 상태를 지정하는 멱등 요청이다. 같은 요청을 반복해도 결과가 같으므로 연타와 롤백이 안전하다.
  - 응답 200: `{ emoji, count, reacted, temperature }` (해당 Kudo의 갱신된 값) / 400(알 수 없는 이모지) / 404
- **GET Board 통계** `/api/board`
  - 응답 200: `{ kudoCount, reactionCount, temperature }`
- **KudoView** 형태: `id`, `author`, `recipient | null`, `category`, `message`, `createdAt`, `editedAt | null`, `reactions`(네 이모지 각각 `{ count, reacted }`), `temperature`. 비밀번호 관련 필드는 어떤 경우에도 포함하지 않는다.

### Visitor 식별

- 익명 Visitor ID(UUID)를 httpOnly, SameSite=Lax, 운영 환경에서 Secure, 유효기간 1년 쿠키로 둔다.
- 쿠키가 없으면 Reaction 요청(PUT·DELETE)을 처리할 때 새 ID를 발급해 응답에 쿠키를 싣는다. 쿠키가 없는 Visitor는 아직 누른 Reaction이 없으므로, 첫 렌더와 목록 조회에서는 `reacted`를 모두 false로 계산하면 된다.
- `reacted` 값은 이 ID로 서버에서 계산한다. localStorage는 쓰지 않는다.

### 검증

- Zod 스키마 하나를 클라이언트 폼과 서버가 공유한다. 서버는 클라이언트 검증을 신뢰하지 않고 항상 다시 검증한다.
- 문자열은 trim 후 검증한다. Author가 trim 후 비면 "익명", Recipient가 trim 후 비면 null.
- 길이: Author·Recipient 최대 20자, Message 1~200자, 비밀번호 4~20자. Message 길이는 사용자가 보는 글자 수 기준으로 센다.
- 폼의 Message 입력은 200자에서 더 입력되지 않으며 실시간 카운터를 보여준다.

### 비밀번호

- 의존성 없이 Node 내장 `crypto`의 scrypt로 해시한다. Kudo마다 무작위 salt를 만들어 salt와 해시를 함께 저장하고, 확인할 때는 상수 시간 비교(`timingSafeEqual`)를 쓴다.
- 수정·삭제 시 해시 비교 후 불일치하면 403 `INVALID_PASSWORD`. 존재하지 않는 Kudo는 404.

### 요청 횟수 제한

- 작성: IP당 1분에 5회. 비밀번호 확인(수정·삭제): IP당 1분에 5회. 초과 시 429 `RATE_LIMITED`.
- IP는 Vercel이 넣어주는 전달 헤더의 첫 값을 쓰고, 없으면 "unknown"으로 묶는다.
- Reaction과 조회는 제한하지 않는다.

### 목록 조회·정렬·커서

- 최신순: id desc. id는 생성 순서와 일치하는 identity이므로 작성 시각 대신 id로 정렬한다. 커서는 마지막 항목의 id다.
- 인기순: (리액션 총합 desc, id desc). 커서는 다음 페이지의 시작 위치(offset)다. 총합은 reactions 집계로 구한다.
- 커서는 두 정렬 모두 음이 아닌 정수 문자열이며, 해석할 수 없으면 400이다.
- 인기순은 스크롤 도중 총합이 바뀌면 항목이 겹칠 수 있으므로, 클라이언트는 id 기준으로 중복을 제거한다.
- 검색은 Message·Author·Recipient에 대한 대소문자 무시 부분 일치이며, `%`, `_`, `\`는 이스케이프해 글자 그대로 찾는다.
- 동적 WHERE/ORDER BY는 드라이버의 템플릿 합성으로 조립하고, 정렬 방향 같은 식별자만 화이트리스트를 거쳐 raw로 삽입한다.

### 온도

- Kudo Temperature = min(99.9, 36.5 + 0.5 × 해당 Kudo의 리액션 수), 소수 첫째 자리 반올림.
- Board Temperature = min(99.9, 36.5 + 0.1 × 전체 리액션 수 + 0.2 × 전체 Kudo 수), 소수 첫째 자리 반올림.
- 색 구간: 40.0° 미만 초록, 40.0° 이상 50.0° 미만 주황, 50.0° 이상 빨강.
- 공식과 구간 판정은 도메인의 순수 함수 하나에 모으고, 서버 응답과 클라이언트 낙관적 갱신 모두 이 함수를 쓴다.

### 클라이언트 상호작용

- **목록**: 필터 조합(category, q, sort)을 쿼리 키로 하는 무한 조회. 목록 끝의 감지 요소가 보이면 다음 페이지를 부른다.
- **URL 동기화**: 필터·검색·정렬 변경은 주소창의 쿼리 문자열을 교체(히스토리 누적 없음)한다. 검색 입력은 300ms 디바운스.
- **Reaction 낙관적 갱신**: 누르는 즉시 캐시된 모든 페이지에서 해당 Kudo의 count·reacted·temperature를 바꾼다. 실패하면 요청 전 스냅샷으로 되돌리고 오류 토스트를 띄운다. 성공하면 서버가 돌려준 값으로 확정하고 Board 통계를 다시 불러온다. 같은 Kudo·이모지에 대한 요청이 진행 중인 동안에는 그 버튼을 비활성화해, 요청이 겹치지 않게 한다.
- **작성**: 성공 시 현재 필터와 무관하게 목록과 Board 통계를 다시 불러오고, 성공 토스트를 띄운다.
- **수정**: 성공 시 캐시의 해당 카드를 응답으로 교체한다. 수정 후 현재 Category 필터에 맞지 않게 되면 목록을 다시 불러온다.
- **삭제**: 성공 시 캐시에서 해당 카드를 제거하고 Board 통계를 다시 불러온다.
- **오류 문구**: API의 `error.message`를 토스트나 필드 아래 문구로 그대로 쓴다. 네트워크 오류는 "네트워크 연결을 확인해 주세요".

### UI

- shadcn/ui(Radix 기반 Dialog·Drawer·Tabs·DropdownMenu 등), lucide-react 아이콘, sonner 토스트, next-themes 다크 모드(기본값: 시스템 설정).
- 작성·수정 폼은 하나의 컴포넌트를 공유하고, 모바일에서는 Drawer(바텀 시트), `md` 이상에서는 Dialog로 연다. 떠 있는 작성 버튼(FAB)은 화면 우하단.
- 카드 메뉴(⋯)에서 수정·삭제를 연다. 삭제는 비밀번호를 받는 확인 Dialog.
- 레이아웃: 모바일 1열, 태블릿 2열, 데스크톱 3열 메이슨리(CSS columns 기반).
- Category 색: 응원 주황, 피드백 파랑, 감사 초록, 칭찬 분홍. 다크 모드에서는 채도·명도를 낮춘 톤. 색상은 CSS 변수 토큰으로 정의한다.
- 헤더: 서비스명, 슬로건, Board Temperature, 테마 전환 버튼.
- 빈 상태 두 가지: Board 자체가 빈 경우(첫 Kudo 유도)와 필터·검색 결과가 없는 경우(필터 초기화 유도).
- 상대 시간은 `Intl.RelativeTimeFormat("ko")`로 표시하고, 마우스를 올리면 절대 시각을 보여준다.
- Reaction 버튼은 `aria-pressed`와 "불꽃 리액션 3개" 같은 접근 가능한 이름을 가진다.
- 메타데이터: 제목 "Mini Kudos", 설명은 슬로건, `lang="ko"`, Open Graph 기본 정보.

### 환경·운영

- 환경 변수는 `DATABASE_URL` 하나. 같은 Neon 브랜치 안에서 데이터베이스를 운영(`neondb`)·로컬 개발(`neondb_dev`)·테스트(`neondb_test`)로 분리한다. 로컬 개발은 `.env.local`, 테스트는 `.env.test`, 운영 연결 문자열은 Next.js가 자동으로 읽지 않는 `.env.prod`에 두며 모두 git에 올리지 않는다. (브랜치 분리 대신 DB 분리를 고른 이유: Neon CLI 로그인 없이 진행할 수 있고, 이 규모에서는 격리 수준이 같다.)
- npm 스크립트: 개발 서버, 빌드, 린트, 테스트, 마이그레이션 적용, 시드 투입.
- 시드: 네 Category가 고루 섞인 예시 Kudo 12개와 Reaction. 여러 번 실행해도 중복되지 않도록 기존 시드를 지우고 다시 넣는다.
- 배포: GitHub에 push → Vercel 연결, Vercel 환경 변수에 운영 브랜치 `DATABASE_URL` 등록, 운영 DB에 마이그레이션 적용. push 전에 로컬에서 빌드·린트·테스트 통과를 확인한다.

## 테스트 결정 (Testing Decisions)

- **좋은 테스트의 기준**: 겉에서 관찰 가능한 동작(HTTP 상태 코드, 응답 본문, 이후 조회 결과)만 검증한다. 내부 함수 호출 여부, SQL 문자열, 내부 모듈 구조는 검증하지 않는다. 내부를 리팩터링해도 테스트가 깨지지 않아야 한다.
- **도구**: Vitest(Node 환경).
- **주 경계 — Route Handler**: 테스트에서 실제 `Request` 객체를 만들어 Route Handler 함수를 직접 호출하고, 테스트용 Neon 브랜치 DB를 실제로 사용한다. 이 경계 하나로 다음을 검증한다.
  - 작성: 정상 201, trim·"익명" 기본값·Recipient null 처리, 길이·필수값 위반 400과 fieldErrors, 응답에 비밀번호 관련 필드 부재
  - 목록: 최신순·인기순 정렬, Category 필터, 검색(대소문자 무시, `%`·`_` 이스케이프), 커서로 이어 받을 때 중복·누락 없음, 잘못된 커서 400
  - 수정: 올바른 비밀번호 200과 editedAt 설정, 틀린 비밀번호 403, 없는 id 404
  - 삭제: 204 후 목록에서 사라짐, 해당 Reaction 함께 삭제, 틀린 비밀번호 403, 없는 id 404
  - Reaction: PUT 반복 시 count가 1에 머무름(멱등), DELETE 후 0, 서로 다른 Visitor는 각각 집계, reacted가 요청한 Visitor 기준, 알 수 없는 이모지 400, 없는 Kudo 404
  - 요청 횟수 제한: 같은 IP로 1분 안에 6번째 작성·비밀번호 확인이 429, 다른 IP는 영향 없음
  - Board 통계: Kudo·Reaction 수와 온도가 실제 데이터와 일치
- **보조 경계 — 온도 순수 함수**: DB 없이 Kudo·Board 온도 공식, 99.9° 상한, 반올림, 색 구간 경계값(39.9 / 40.0 / 49.9 / 50.0)을 검증한다.
- **테스트 격리**: 각 테스트 전에 테이블을 비운다. 한 DB를 공유하므로 테스트 파일은 순차 실행한다. 요청 횟수 제한 테스트는 테스트마다 다른 IP를 써서 서로 간섭하지 않게 한다.
- **자동 테스트하지 않는 부분**: Optimistic UI 롤백, 무한 스크롤, Drawer/Dialog 전환, 다크 모드, URL 동기화. 각 구현 티켓에 수동 확인 항목으로 적는다.
- **기존 사례**: 새 프로젝트라 저장소에 참고할 테스트가 없다. 첫 Route Handler 테스트가 이후 테스트의 기준 사례가 된다.

## 범위 밖 (Out of Scope)

- 회원가입·로그인·계정, 관리자 기능과 비밀번호 복구
- 여러 개의 Board(팀별·개인별), Recipient 프로필·사람별 모아보기
- 댓글, 이미지 첨부, 알림, 실시간 동기화(다른 Visitor의 변경을 즉시 반영)
- 금칙어·욕설 필터, CAPTCHA
- 소프트 삭제와 복구, 수정 이력 보관
- 다국어 지원
- Playwright 등 E2E 테스트
- 기기·브라우저를 넘나드는 Visitor 식별(쿠키를 지우거나 다른 기기에서는 새 Visitor로 취급한다)

## 추가 메모 (Further Notes)

- 이 과제는 "Claude Code와 Matt Pocock Skill을 이용한 간단한 웹앱 제작"이며, 제출물은 GitHub 저장소 URL과 Vercel 배포 URL이다. 개발 과정은 `grill-with-docs` → `to-spec` → `to-tickets` → `implement` → `code-review` 순서로 진행하고, 산출물(`CONTEXT.md`, `docs/adr/`, `.scratch/mini-kudos/`)과 티켓 단위 커밋으로 과정을 남긴다. README에 개발 과정 섹션을 둔다.
- 현재 `.env.local`의 `DATABASE_URL`이 Neon의 어느 브랜치인지 확인되지 않았다. 첫 DB 관련 티켓 착수 전에 확인하고, dev·test 브랜치가 없으면 Neon 콘솔에서 만든다(사람이 해야 하는 단계).
- Matt Pocock 스킬은 `.agents/skills/`에 설치되어 있고, Claude Code가 인식하도록 `.claude/skills`를 심볼릭 링크로 연결했다.
