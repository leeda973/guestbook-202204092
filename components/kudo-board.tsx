"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ComposeDialog } from "@/components/compose-dialog";
import { KudoCard } from "@/components/kudo-card";
import { KudoFilterBar } from "@/components/kudo-filters";
import { TopColleagues } from "@/components/top-colleagues";
import { KudoSkeletonGrid } from "@/components/kudo-skeleton";
import { Button } from "@/components/ui/button";
import { useColumnCount } from "@/hooks/use-media-query";
import { api } from "@/lib/api-client";
import { distributeToColumns } from "@/lib/columns";
import { KUDOS_KEY } from "@/lib/kudo-cache";
import { filtersToSearch, parseFilters, type KudoFilters, type KudoPage } from "@/lib/kudo-schema";


type Props = { initial: KudoPage | null; initialFilters: KudoFilters };

export function KudoBoard({ initial, initialFilters }: Props) {
  const [composeOpen, setComposeOpen] = useState(false);
  const columnCount = useColumnCount();
  const searchParams = useSearchParams();
  const filters = parseFilters((k) => searchParams.get(k));
  const search = filtersToSearch(filters);
  const hasFilters = search !== "";

  // 서버 왕복 없이 주소창만 바꾼다(히스토리를 쌓지 않음). useSearchParams가 따라 갱신된다.
  const setFilters = useCallback((next: KudoFilters) => {
    const qs = filtersToSearch(next);
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, []);

  const query = useInfiniteQuery({
    queryKey: [...KUDOS_KEY, search],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams(search);
      if (pageParam) params.set("cursor", pageParam);
      return api<KudoPage>(`/api/kudos?${params}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    // 서버가 그린 첫 페이지는 같은 필터일 때만 초기 데이터로 쓴다.
    initialData:
      initial && search === filtersToSearch(initialFilters) ? { pages: [initial], pageParams: [null] } : undefined,
  });
  // 인기순은 스크롤 도중 합계가 바뀌면 페이지 경계에서 같은 Kudo가 다시 올 수 있어 id로 중복을 걸러낸다.
  const items = [...new Map(query.data?.pages.flatMap((p) => p.items).map((k) => [k.id, k])).values()];

  // 목록 끝의 감지 요소가 화면에 들어오면 다음 페이지를 부른다.
  const sentinel = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  let content: React.ReactNode;
  if (query.isPending) {
    content = <KudoSkeletonGrid />;
  } else if (query.isError && !query.data) {
    content = (
      <div className="py-24 text-center">
        <p className="mb-4 text-muted-foreground">Kudo를 불러오지 못했어요.</p>
        <Button variant="outline" onClick={() => query.refetch()}>
          다시 시도
        </Button>
      </div>
    );
  } else if (items.length === 0 && hasFilters) {
    content = (
      <div className="py-24 text-center">
        <p className="mb-4 text-lg">조건에 맞는 Kudo가 없어요</p>
        <Button variant="outline" onClick={() => setFilters({})}>
          필터 초기화
        </Button>
      </div>
    );
  } else if (items.length === 0) {
    content = (
      <div className="py-24 text-center">
        <p className="mb-4 text-lg">첫 번째 응원 메시지를 남겨보세요! 🎉</p>
        <Button onClick={() => setComposeOpen(true)}>Kudo 남기기</Button>
      </div>
    );
  } else {
    content = (
      <>
        {/* 왼쪽 열부터 차례로 나눠 담아 순서가 왼쪽→오른쪽으로 읽히게 한다. */}
        <div className="flex items-start gap-4">
          {distributeToColumns(items, columnCount).map((column, i) => (
            <div key={i} className="flex min-w-0 flex-1 flex-col gap-4">
              {column.map((kudo) => (
                <KudoCard key={kudo.id} kudo={kudo} onRecipientClick={(to) => setFilters({ ...filters, to })} />
              ))}
            </div>
          ))}
        </div>
        <div ref={sentinel} className="py-8 text-center text-sm text-muted-foreground" aria-live="polite">
          {isFetchingNextPage
            ? "더 불러오는 중…"
            : query.isFetchNextPageError
              ? <Button variant="outline" size="sm" onClick={() => fetchNextPage()}>다시 시도</Button>
              : !hasNextPage && "모든 Kudo를 다 봤어요"}
        </div>
      </>
    );
  }

  return (
    <>
      <TopColleagues selected={filters.to} onSelect={(to) => setFilters({ ...filters, to })} />
      <KudoFilterBar filters={filters} onChange={setFilters} />
      {content}
      <Button
        size="icon-lg"
        className="fixed right-5 bottom-5 size-14 rounded-full shadow-lg"
        aria-label="Kudo 남기기"
        onClick={() => setComposeOpen(true)}
      >
        <PlusIcon className="size-6" />
      </Button>
      <ComposeDialog open={composeOpen} onOpenChange={setComposeOpen} />
    </>
  );
}
