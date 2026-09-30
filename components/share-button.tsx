"use client";

import { Share2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success("링크를 복사했어요");
  } catch {
    toast.error("링크를 복사하지 못했어요");
  }
}

/**
 * Kudo Page 주소를 공유한다. 터치 기기(모바일)에서만 시스템 공유 창을 열고, 데스크톱은 주소를 복사한다.
 * 데스크톱 브라우저도 Web Share API를 지원하는 경우가 많아, API 지원 여부만으로는 나누지 않는다.
 */
export function ShareButton({ kudoId, title }: { kudoId: number; title: string }) {
  async function share() {
    const url = `${window.location.origin}/k/${kudoId}`;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (!touch || !navigator.share) return copyLink(url);
    try {
      await navigator.share({ title, url });
    } catch (e) {
      // Visitor가 공유 창을 닫았으면 조용히 넘어가고, 그 밖의 실패는 주소 복사로 대신한다.
      if (!(e instanceof DOMException && e.name === "AbortError")) await copyLink(url);
    }
  }

  return (
    <Button variant="ghost" size="icon-xs" aria-label="Kudo 공유" onClick={share}>
      <Share2Icon />
    </Button>
  );
}
