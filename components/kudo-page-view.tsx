"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KudoCard } from "@/components/kudo-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { kudoKey } from "@/lib/kudo-cache";
import type { KudoView } from "@/lib/kudo-schema";

/** Kudo Page 본문: 카드 한 장을 크게 보여준다. 리액션·수정은 캐시 도우미가 이 쿼리도 함께 갱신한다. */
export function KudoPageView({ initial }: { initial: KudoView }) {
  const router = useRouter();
  const { data: kudo } = useQuery({
    queryKey: kudoKey(initial.id),
    queryFn: () => api<KudoView>(`/api/kudos/${initial.id}`),
    initialData: initial,
  });

  return (
    <div className="mx-auto grid max-w-xl gap-6 py-6">
      <KudoCard kudo={kudo} large className="p-6" onDeleted={() => router.push("/")} />
      <Button asChild variant="outline" className="justify-self-center">
        <Link href="/">보드 전체 보기</Link>
      </Button>
    </div>
  );
}
