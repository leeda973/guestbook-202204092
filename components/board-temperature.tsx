"use client";

import { TemperatureBadge } from "@/components/temperature-badge";
import { useBoardStats } from "@/hooks/use-board-stats";

export function BoardTemperature() {
  const { data } = useBoardStats();
  if (!data) return <span className="h-5 w-24 animate-pulse rounded bg-muted" aria-hidden />;
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <span className="hidden sm:inline">우리 보드 온도</span>
      <TemperatureBadge value={data.temperature} label="우리 보드 온도" className="text-base" />
    </span>
  );
}
