import { describe, expect, test } from "vitest";
import { boardTemperature, colleagueTemperature, kudoTemperature, temperatureLevel } from "@/lib/temperature";

describe("쿠도 온도", () => {
  test.each([
    [0, 36.5],
    [1, 37],
    [3, 38],
    [7, 40],
    [126, 99.5],
    [127, 99.9],
    [1000, 99.9],
  ])("리액션 %i개면 %d°", (reactions, expected) => {
    expect(kudoTemperature(reactions)).toBe(expected);
  });
});

describe("보드 온도", () => {
  test.each([
    [0, 0, 36.5],
    [1, 0, 36.6],
    [3, 2, 37.2],
    [10, 5, 38.5],
    [7, 1, 37.4],
    [1000, 1000, 99.9],
  ])("리액션 %i개, Kudo %i개면 %d°", (reactions, kudos, expected) => {
    expect(boardTemperature(reactions, kudos)).toBe(expected);
  });
});

describe("온도 구간", () => {
  test.each([
    [36.5, "mild"],
    [39.9, "mild"],
    [40, "warm"],
    [49.9, "warm"],
    [50, "hot"],
    [99.9, "hot"],
  ] as const)("%d°는 %s", (temperature, level) => {
    expect(temperatureLevel(temperature)).toBe(level);
  });
});

describe("동료 온도", () => {
  test.each([
    [0, 0, 36.5],
    [1, 0, 36.7],
    [2, 3, 37.2],
    [5, 10, 38.5],
    [1000, 1000, 99.9],
  ])("받은 Kudo %i개, 리액션 %i개면 %d°", (kudos, reactions, expected) => {
    expect(colleagueTemperature(kudos, reactions)).toBe(expected);
  });
});
