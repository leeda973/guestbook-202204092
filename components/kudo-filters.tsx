"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES, CATEGORY_LABEL, type Category, type KudoFilters } from "@/lib/kudo-schema";
import { cn } from "@/lib/utils";

const CHIPS: { value?: Category; label: string }[] = [
  { label: "전체" },
  ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABEL[c] })),
];

export function KudoFilterBar({ filters, onChange }: { filters: KudoFilters; onChange: (f: KudoFilters) => void }) {
  const [text, setText] = useState(filters.q ?? "");

  // 필터 초기화처럼 바깥에서 검색어가 바뀌면 입력창도 맞춘다.
  const [lastQ, setLastQ] = useState(filters.q);
  if (filters.q !== lastQ) {
    setLastQ(filters.q);
    setText(filters.q ?? "");
  }

  // 입력을 멈추고 300ms 뒤에 검색한다.
  useEffect(() => {
    const q = text.trim() || undefined;
    if (q === filters.q) return;
    const timer = setTimeout(() => onChange({ ...filters, q }), 300);
    return () => clearTimeout(timer);
  }, [text, filters, onChange]);

  return (
    <div className="mb-6 grid gap-3">
      <Tabs
        value={filters.sort ?? "latest"}
        onValueChange={(v) => onChange({ ...filters, sort: v === "popular" ? v : undefined })}
      >
        <TabsList aria-label="정렬">
          <TabsTrigger value="latest">최신순</TabsTrigger>
          <TabsTrigger value="popular">인기순</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="카테고리 필터">
          {CHIPS.map((chip) => {
            const active = filters.category === chip.value;
            return (
              <button
                key={chip.label}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ ...filters, category: chip.value })}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  active ? "border-foreground bg-foreground text-background" : "hover:bg-muted",
                )}
              >
                {chip.label}
              </button>
            );
          })}
          {filters.to && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, to: undefined })}
              aria-label={`받는 사람 조건 ${filters.to} 해제`}
              className="inline-flex items-center gap-1 rounded-full border border-foreground bg-foreground px-3 py-1 text-sm text-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              To. {filters.to}
              <XIcon className="size-3.5" aria-hidden />
            </button>
          )}
        </div>
        <div className="relative sm:w-64">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Kudo 검색"
            placeholder="메시지, 이름으로 검색"
            className="pl-8"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
