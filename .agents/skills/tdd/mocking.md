# 언제 모킹하는가

**시스템 경계**에서만 모킹하세요.

- 외부 API(결제, 이메일 등)
- 데이터베이스(경우에 따라. 테스트 DB를 우선)
- 시간/무작위성
- 파일 시스템(경우에 따라)

모킹하지 마세요.

- 직접 만든 클래스/모듈
- 내부 협력 객체
- 직접 통제하는 모든 것

## 모킹하기 쉬운 설계

시스템 경계에서는 모킹하기 쉬운 인터페이스를 설계하세요.

**1. 의존성 주입을 쓰세요**

외부 의존성을 내부에서 만들지 말고 밖에서 넘겨받으세요.

```typescript
// 모킹하기 쉬움
function processPayment(order, paymentClient) {
  return paymentClient.charge(order.total);
}

// 모킹하기 어려움
function processPayment(order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

**2. 범용 fetcher보다 SDK 스타일 인터페이스를 쓰세요**

조건 분기가 있는 범용 함수 하나 대신, 외부 작업마다 전용 함수를 만드세요.

```typescript
// 좋음: 함수마다 독립적으로 모킹 가능
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  getOrders: (userId) => fetch(`/users/${userId}/orders`),
  createOrder: (data) => fetch('/orders', { method: 'POST', body: data }),
};

// 나쁨: 목 안에 조건 분기가 필요함
const api = {
  fetch: (endpoint, options) => fetch(endpoint, options),
};
```

SDK 방식의 장점:
- 목마다 하나의 정해진 모양을 반환한다
- 테스트 준비에 조건 분기가 없다
- 테스트가 어떤 엔드포인트를 쓰는지 보기 쉽다
- 엔드포인트별로 타입 안전하다
