import { StatusScreen } from "@/components/status-screen";

export default function NotFound() {
  return (
    <StatusScreen emoji="🧭" title="페이지를 찾을 수 없어요" description="주소가 바뀌었거나 없는 페이지예요." />
  );
}
