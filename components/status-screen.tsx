import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  emoji: string;
  title: string;
  description?: string;
  /** 보드로 가기 외에 더 보여줄 버튼(예: 다시 시도) */
  action?: React.ReactNode;
};

/** 404·오류처럼 목록 대신 안내 한 가지를 보여주는 화면. */
export function StatusScreen({ emoji, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <p className="mb-4 text-5xl" aria-hidden>
        {emoji}
      </p>
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      {description && <p className="mb-6 text-muted-foreground">{description}</p>}
      <div className="flex gap-2">
        {action}
        <Button asChild variant={action ? "outline" : "default"}>
          <Link href="/">보드로 가기</Link>
        </Button>
      </div>
    </div>
  );
}
