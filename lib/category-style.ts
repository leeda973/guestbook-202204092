import type { Category } from "@/lib/kudo-schema";

/** Category별 카드 배경. 색 값은 globals.css의 CSS 변수 토큰에 있다. */
export const CATEGORY_BG: Record<Category, string> = {
  cheer: "bg-cheer",
  feedback: "bg-feedback",
  thanks: "bg-thanks",
  praise: "bg-praise",
};
