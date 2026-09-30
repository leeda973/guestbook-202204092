import { describe, expect, test } from "vitest";
import { koreanDateTime, koreanFullDateTime } from "@/lib/datetime";

const at = (iso: string) => new Date(iso).getTime();

describe("작성 시각 (한국 시간)", () => {
  test("올해 글은 'M월 D일 HH:mm'(24시간제, 한국 시간)이다", () => {
    expect(koreanDateTime("2026-09-30T05:05:00Z", at("2026-09-30T06:00:00Z"))).toBe("9월 30일 14:05");
  });

  test("UTC로는 전날이어도 한국 날짜로 표시한다", () => {
    expect(koreanDateTime("2026-09-30T16:30:00Z", at("2026-10-01T00:00:00Z"))).toBe("10월 1일 01:30");
  });

  test("다른 해의 글은 연도를 붙인다", () => {
    expect(koreanDateTime("2025-12-31T14:59:00Z", at("2026-09-30T00:00:00Z"))).toBe("2025년 12월 31일 23:59");
  });

  test("연도는 한국 시간 기준으로 판단한다(UTC로는 작년이지만 한국은 올해)", () => {
    expect(koreanDateTime("2025-12-31T15:30:00Z", at("2026-01-01T00:10:00Z"))).toBe("1월 1일 00:30");
  });

  test("마우스를 올렸을 때 보이는 전체 시각은 연도와 요일을 포함한다", () => {
    expect(koreanFullDateTime("2026-09-30T05:05:00Z")).toBe("2026년 9월 30일 수요일 14:05");
  });
});
