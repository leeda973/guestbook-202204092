"use client";

import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ComposeDialog } from "@/components/compose-dialog";
import { DeleteKudoDialog } from "@/components/delete-kudo-dialog";
import { ShareButton } from "@/components/share-button";
import { kudoTitle } from "@/lib/kudo-title";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORY_BG } from "@/lib/category-style";
import { CATEGORY_LABEL, recipientHref, type KudoView } from "@/lib/kudo-schema";
import { koreanDateTime, koreanFullDateTime, relativeTime } from "@/lib/datetime";
import { ReactionBar } from "@/components/reaction-bar";
import { TemperatureBadge } from "@/components/temperature-badge";
import { cn } from "@/lib/utils";

const RECIPIENT_LINK =
  "rounded-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

type Props = {
  kudo: KudoView;
  /** Kudo Page에서 삭제 뒤(또는 이미 삭제된 것을 알았을 때) 보드로 돌아가게 할 때 쓴다. */
  onDeleted?: () => void;
  className?: string;
  /** Kudo Page에서 한 장을 크게 보여줄 때 */
  large?: boolean;
  /** 보드에서는 다른 필터를 유지한 채 받는 사람 조건만 더한다. 없으면(Kudo Page) 보드 모아보기 링크가 된다. */
  onRecipientClick?: (name: string) => void;
};

export function KudoCard({ kudo, onDeleted, className, large, onRecipientClick }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <article className={cn("rounded-xl p-4 shadow-sm", CATEGORY_BG[kudo.category], className)}>
      <header className="mb-2 flex items-start justify-between gap-2 text-xs text-foreground/70">
        <span className="shrink-0 rounded-full bg-background/60 px-2 py-0.5 font-medium">
          {CATEGORY_LABEL[kudo.category]}
        </span>
        <span className="flex items-center gap-1">
          {/* 상대 시간과 한국 시간의 정확한 작성 시각을 함께 보여준다. 좁은 카드에서는 시각 부분이 줄바꿈된다. */}
          <time dateTime={kudo.createdAt} title={koreanFullDateTime(kudo.createdAt)} className="text-right">
            {/* 상대 시간만 렌더 시점에 따라 달라질 수 있어 이 부분만 하이드레이션 경고를 억제한다. */}
            <span suppressHydrationWarning>{relativeTime(kudo.createdAt)}</span>
            {" · "}
            <span className="inline-block">{koreanDateTime(kudo.createdAt)}</span>
            {kudo.editedAt && " (수정됨)"}
          </time>
          <ShareButton kudoId={kudo.id} title={kudoTitle(kudo)} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" aria-label="Kudo 메뉴">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <PencilIcon /> 수정
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                <Trash2Icon /> 삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </header>
      {kudo.recipient && (
        <p className="mb-1 text-sm font-semibold">
          {onRecipientClick ? (
            <button
              type="button"
              onClick={() => onRecipientClick(kudo.recipient!)}
              className={RECIPIENT_LINK}
              aria-label={`${kudo.recipient}님이 받은 Kudo 모아보기`}
            >
              To. {kudo.recipient}
            </button>
          ) : (
            <Link
              href={recipientHref(kudo.recipient)}
              className={RECIPIENT_LINK}
              aria-label={`${kudo.recipient}님이 받은 Kudo 모아보기`}
            >
              To. {kudo.recipient}
            </Link>
          )}
        </p>
      )}
      <p className={cn("leading-relaxed break-words whitespace-pre-wrap", large ? "text-xl" : "text-[15px]")}>
        {kudo.message}
      </p>
      <p className="mt-3 text-right text-sm text-foreground/70">From. {kudo.author}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <ReactionBar kudo={kudo} />
        <TemperatureBadge value={kudo.temperature} label="쿠도 온도" className="text-xs" />
      </div>
      {editOpen && <ComposeDialog open onOpenChange={setEditOpen} kudo={kudo} onGone={onDeleted} />}
      <DeleteKudoDialog kudoId={kudo.id} open={deleteOpen} onOpenChange={setDeleteOpen} onDeleted={onDeleted} />
    </article>
  );
}
