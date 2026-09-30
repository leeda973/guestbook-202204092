import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { KudoPageView } from "@/components/kudo-page-view";
import { HttpError } from "@/lib/http";
import { excerpt, kudoTitle } from "@/lib/kudo-title";
import { getKudo } from "@/lib/kudos";
import { sharePreview } from "@/lib/site";
import { visitorFromCookies } from "@/lib/visitor";

// 메타데이터와 페이지가 같은 요청에서 한 번만 조회하도록 묶는다.
const loadKudo = cache(async (id: string) => {
  const visitorId = await visitorFromCookies();
  try {
    return await getKudo(id, visitorId);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  }
});

export async function generateMetadata({ params }: PageProps<"/k/[id]">): Promise<Metadata> {
  const kudo = await loadKudo((await params).id);
  const title = kudoTitle(kudo);
  const description = excerpt(kudo.message, 80);
  return { title, description, ...sharePreview(title, description) };
}

export default async function KudoPage({ params }: PageProps<"/k/[id]">) {
  return <KudoPageView initial={await loadKudo((await params).id)} />;
}
