"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { KudoForm } from "@/components/kudo-form";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { KudoView } from "@/lib/kudo-schema";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; kudo?: KudoView; onGone?: () => void };

/** 데스크톱(md 이상)에서는 모달, 모바일에서는 바텀 시트로 작성·수정 폼을 연다. */
export function ComposeDialog({ open, onOpenChange, kudo, onGone }: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const close = () => onOpenChange(false);
  const TITLE = kudo ? "Kudo 수정하기" : "Kudo 남기기";
  const DESCRIPTION = kudo
    ? "메시지, 카테고리, 받는 사람을 고칠 수 있어요."
    : "동료에게 응원, 피드백, 감사, 칭찬을 전해 보세요.";

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{TITLE}</DialogTitle>
            <DialogDescription>{DESCRIPTION}</DialogDescription>
          </DialogHeader>
          <KudoForm kudo={kudo} onDone={close} onGone={onGone} />
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{TITLE}</DrawerTitle>
          <DrawerDescription>{DESCRIPTION}</DrawerDescription>
        </DrawerHeader>
        <div className="max-h-[75vh] overflow-y-auto px-4 pb-6">
          <KudoForm kudo={kudo} onDone={close} onGone={onGone} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
