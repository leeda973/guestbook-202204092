import { KudoBoard } from "@/components/kudo-board";
import { parseFilters, type KudoPage } from "@/lib/kudo-schema";
import { listKudos } from "@/lib/kudos";
import { visitorFromCookies } from "@/lib/visitor";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const filters = parseFilters((k) => {
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  });
  let initial: KudoPage | null = null;
  try {
    const visitorId = await visitorFromCookies();
    initial = await listKudos(filters, visitorId);
  } catch (e) {
    // 서버 렌더에서 실패하면 클라이언트가 다시 불러오고, 그래도 실패하면 "다시 시도"를 보여준다.
    console.error(e);
  }
  return <KudoBoard initial={initial} initialFilters={filters} />;
}
