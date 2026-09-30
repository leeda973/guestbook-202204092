import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { BOARD_KEY } from "@/lib/kudo-cache";
import type { BoardStats } from "@/lib/kudo-schema";

/** 헤더의 보드 온도와 주간 Top 3가 함께 쓰는 보드 통계. 리액션·작성·수정·삭제 뒤 다시 불러온다. */
export function useBoardStats() {
  return useQuery({ queryKey: BOARD_KEY, queryFn: () => api<BoardStats>("/api/board") });
}
