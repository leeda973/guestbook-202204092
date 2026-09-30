import { describe, expect, test } from "vitest";
import { distributeToColumns } from "@/lib/columns";

describe("카드 열 분배", () => {
  test("왼쪽 열부터 차례로 나눠 담아, 첫 줄이 1·2·3번이 된다", () => {
    expect(distributeToColumns([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([
      [1, 4, 7],
      [2, 5],
      [3, 6],
    ]);
  });

  test("2열이면 홀수 번째는 왼쪽, 짝수 번째는 오른쪽이다", () => {
    expect(distributeToColumns(["a", "b", "c", "d", "e"], 2)).toEqual([
      ["a", "c", "e"],
      ["b", "d"],
    ]);
  });

  test("1열이면 원래 순서 그대로다", () => {
    expect(distributeToColumns([1, 2, 3], 1)).toEqual([[1, 2, 3]]);
  });

  test("카드가 열 수보다 적으면 남는 열은 비어 있다", () => {
    expect(distributeToColumns([1], 3)).toEqual([[1], [], []]);
  });

  test("빈 목록이면 빈 열들이다", () => {
    expect(distributeToColumns([], 2)).toEqual([[], []]);
  });
});
