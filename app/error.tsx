"use client";

import { useEffect } from "react";
import { StatusScreen } from "@/components/status-screen";
import { Button } from "@/components/ui/button";
import { RETRY_LATER_MESSAGE } from "@/lib/http";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // 오류 내용은 화면에 보여주지 않는다.
  return (
    <StatusScreen
      emoji="🛠️"
      title="문제가 생겼어요"
      description={`${RETRY_LATER_MESSAGE}.`}
      action={<Button onClick={() => retry()}>다시 시도</Button>}
    />
  );
}
