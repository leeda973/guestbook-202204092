"use client";

import { TemperatureBadge } from "@/components/temperature-badge";
import { useBoardStats } from "@/hooks/use-board-stats";
import { normalizeRecipient } from "@/lib/kudo-schema";
import { cn } from "@/lib/utils";

const MEDALS = ["🥇", "🥈", "🥉"];

type Props = {
  /** 지금 모아 보고 있는 받는 사람(`to` 조건) */
  selected?: string;
  onSelect: (name: string | undefined) => void;
};

/** 이번 주 가장 따뜻한 동료. 필터와 무관하게 항상 보드 전체 기준이다. */
export function TopColleagues({ selected, onSelect }: Props) {
  const colleagues = useBoardStats().data?.topColleagues ?? [];
  if (colleagues.length === 0) return null;

  return (
    <section className="mb-5" aria-labelledby="top-colleagues-title">
      <h2 id="top-colleagues-title" className="mb-2 text-sm font-medium text-muted-foreground">
        이번 주 가장 따뜻한 동료
      </h2>
      <ol className="flex flex-wrap gap-2">
        {colleagues.map((c, i) => {
          const active = !!selected && normalizeRecipient(selected) === normalizeRecipient(c.name);
          return (
            <li key={c.name}>
              <button
                type="button"
                aria-pressed={active}
                aria-label={`${i + 1}위 ${c.name}, 동료 온도 ${c.temperature.toFixed(1)}도`}
                onClick={() => onSelect(active ? undefined : c.name)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  active ? "border-foreground bg-muted font-semibold" : "hover:bg-muted",
                )}
              >
                <span aria-hidden>{MEDALS[i]}</span>
                <span>{c.name}</span>
                <TemperatureBadge value={c.temperature} label="동료 온도" className="text-xs" />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
