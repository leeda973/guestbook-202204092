import { StatusScreen } from "@/components/status-screen";
import { KUDO_GONE_MESSAGE } from "@/lib/kudo-schema";

export default function KudoNotFound() {
  return <StatusScreen emoji="🍃" title={KUDO_GONE_MESSAGE} description="보드에서 다른 Kudo를 둘러보세요." />;
}
