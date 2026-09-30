// 캐시된 모든 목록 페이지(필터별)에서 특정 Kudo를 찾아 바꾸거나 지우는 도우미.
import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { KudoPage, KudoView } from "@/lib/kudo-schema";

type Pages = InfiniteData<KudoPage, string | null>;

export const KUDOS_KEY = ["kudos"] as const;
export const BOARD_KEY = ["board"] as const;
/** Kudo Page의 단건 쿼리 키 */
export const kudoKey = (id: number) => ["kudo", id] as const;

function mapCachedItems(qc: QueryClient, map: (items: KudoView[]) => KudoView[]) {
  qc.setQueriesData<Pages>({ queryKey: KUDOS_KEY }, (data) =>
    data && { ...data, pages: data.pages.map((page) => ({ ...page, items: map(page.items) })) },
  );
}

/** 목록 캐시와 Kudo Page의 단건 캐시에서 같은 Kudo를 함께 바꾼다. */
export function patchCachedKudo(qc: QueryClient, id: number, update: (kudo: KudoView) => KudoView) {
  mapCachedItems(qc, (items) => items.map((k) => (k.id === id ? update(k) : k)));
  qc.setQueryData<KudoView>(kudoKey(id), (kudo) => kudo && update(kudo));
}

export function removeCachedKudo(qc: QueryClient, id: number) {
  mapCachedItems(qc, (items) => items.filter((k) => k.id !== id));
}
