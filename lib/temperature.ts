// 쿠도·보드·동료 온도 공식. 서버 응답과 클라이언트 낙관적 갱신이 모두 이 함수를 쓴다.
const BASE = 36.5;
const MAX = 99.9;

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number) => Math.min(MAX, round1(n));

/** 리액션 하나당 +0.5° */
export const kudoTemperature = (reactions: number) => clamp(BASE + 0.5 * reactions);

/** 전체 리액션 하나당 +0.1°, Kudo 하나당 +0.2° */
export const boardTemperature = (reactions: number, kudos: number) => clamp(BASE + 0.1 * reactions + 0.2 * kudos);

/** 최근 7일 동안 받은 Kudo 하나당 +0.2°, 그 Kudo들의 리액션 하나당 +0.1° */
export const colleagueTemperature = (kudos: number, reactions: number) => clamp(BASE + 0.2 * kudos + 0.1 * reactions);

export type TemperatureLevel = "mild" | "warm" | "hot";

/** 40° 미만 초록(mild), 50° 미만 주황(warm), 그 이상 빨강(hot) */
export function temperatureLevel(t: number): TemperatureLevel {
  if (t < 40) return "mild";
  if (t < 50) return "warm";
  return "hot";
}
