# CONTEXT.md 형식

## 구조

```md
# {컨텍스트 이름}

{이 컨텍스트가 무엇이고 왜 존재하는지 한두 문장으로 설명}

## Language

**Order**:
{용어에 대한 한두 문장 설명}
_Avoid_: Purchase, transaction

**Invoice**:
배송 후 고객에게 보내는 결제 요청.
_Avoid_: Bill, payment request

**Customer**:
주문을 하는 개인 또는 조직.
_Avoid_: Client, buyer, account
```

## 규칙

- **분명한 입장을 가지세요.** 같은 개념을 가리키는 말이 여러 개라면 가장 좋은 것 하나를 고르고 나머지는 `_Avoid_`에 적으세요.
- **정의는 짧게.** 최대 한두 문장입니다. 무엇을 *하는지*가 아니라 무엇*인지*를 정의하세요.
- **이 프로젝트의 맥락에 고유한 용어만 넣으세요.** 일반적인 프로그래밍 개념(타임아웃, 에러 타입, 유틸리티 패턴)은 프로젝트에서 많이 쓰더라도 넣지 않습니다. 용어를 추가하기 전에 스스로 물으세요. 이 맥락에 고유한 개념인가, 일반적인 프로그래밍 개념인가? 앞의 것만 넣습니다.
- 자연스럽게 묶이는 무리가 보이면 **소제목으로 묶으세요.** 모든 용어가 하나의 응집된 영역에 속한다면 평평한 목록도 괜찮습니다.

## 단일 컨텍스트와 멀티 컨텍스트 저장소

**단일 컨텍스트(대부분의 저장소):** 저장소 루트에 `CONTEXT.md` 하나.

**멀티 컨텍스트:** 저장소 루트의 `CONTEXT-MAP.md`가 컨텍스트 목록과 위치, 서로의 관계를 나열합니다.

```md
# Context Map

## Contexts

- [Ordering](./src/ordering/CONTEXT.md): 고객 주문을 받고 추적한다
- [Billing](./src/billing/CONTEXT.md): 청구서를 만들고 결제를 처리한다
- [Fulfillment](./src/fulfillment/CONTEXT.md): 창고 피킹과 배송을 관리한다

## Relationships

- **Ordering → Fulfillment**: Ordering이 `OrderPlaced` 이벤트를 발행하고, Fulfillment가 이를 받아 피킹을 시작한다
- **Fulfillment → Billing**: Fulfillment가 `ShipmentDispatched` 이벤트를 발행하고, Billing이 이를 받아 청구서를 만든다
- **Ordering ↔ Billing**: `CustomerId`와 `Money` 타입을 공유한다
```

스킬은 어느 구조인지 스스로 판단합니다.

- `CONTEXT-MAP.md`가 있으면 그것을 읽어 컨텍스트를 찾습니다
- 루트 `CONTEXT.md`만 있으면 단일 컨텍스트입니다
- 둘 다 없으면 첫 용어가 정해질 때 루트 `CONTEXT.md`를 만듭니다

컨텍스트가 여러 개일 때는 현재 주제가 어느 컨텍스트에 속하는지 추론하세요. 불분명하면 물으세요.
