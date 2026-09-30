# 이슈 트래커: 로컬 마크다운

이 저장소의 이슈와 스펙은 `.scratch/` 아래 마크다운 파일로 관리합니다.

## 규칙

- 기능 하나당 디렉터리 하나: `.scratch/<feature-slug>/`
- 스펙은 `.scratch/<feature-slug>/spec.md`
- 구현 이슈는 티켓 하나당 파일 하나로 `.scratch/<feature-slug>/issues/<NN>-<slug>.md`에 두며, 번호는 `01`부터 시작합니다. 여러 티켓을 한 파일에 합치지 않습니다.
- 트리아지 상태는 각 이슈 파일 상단 근처의 `Status:` 줄에 기록합니다(역할 문자열은 `triage-labels.md` 참고).
- 댓글과 대화 기록은 파일 맨 아래 `## Comments` 제목 아래에 이어 붙입니다.

## 스킬이 "이슈 트래커에 게시하라"고 할 때

`.scratch/<feature-slug>/` 아래에 새 파일을 만듭니다(필요하면 디렉터리도 만듭니다).

## 스킬이 "관련 티켓을 가져오라"고 할 때

지정된 경로의 파일을 읽습니다. 보통 사용자가 경로나 이슈 번호를 직접 알려줍니다.

## 길찾기(Wayfinding) 작업

`/wayfinder`가 사용합니다. **맵(map)**은 티켓마다 **자식(child)** 파일을 하나씩 가진 파일입니다.

- **맵**: `.scratch/<effort>/map.md` (Notes / Decisions-so-far / Fog 본문)
- **자식 티켓**: `.scratch/<effort>/issues/NN-<slug>.md`, 번호는 `01`부터이며 본문에 질문을 적습니다. `Type:` 줄에 티켓 종류(`research`/`prototype`/`grilling`/`task`)를, `Status:` 줄에 `claimed`/`resolved`를 기록합니다.
- **차단(Blocking)**: 상단 근처의 `Blocked by: NN, NN` 줄. 나열된 파일이 모두 `resolved`이면 차단이 풀립니다.
- **최전선(Frontier)**: `.scratch/<effort>/issues/`에서 열려 있고, 차단되지 않았고, 아무도 맡지 않은 파일을 찾습니다. 번호가 가장 낮은 것이 우선입니다.
- **맡기(Claim)**: 작업 전에 `Status: claimed`로 바꾸고 저장합니다.
- **해결(Resolve)**: 답을 `## Answer` 제목 아래에 붙이고 `Status: resolved`로 바꾼 뒤, `map.md`의 Decisions-so-far에 요지와 링크를 추가합니다.
