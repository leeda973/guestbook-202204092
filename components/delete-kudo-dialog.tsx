"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError, isInvalidPassword } from "@/lib/api-client";
import { BOARD_KEY, removeCachedKudo } from "@/lib/kudo-cache";
import { deleteKudoSchema } from "@/lib/kudo-schema";

type Props = { kudoId: number; open: boolean; onOpenChange: (open: boolean) => void; onDeleted?: () => void };

export function DeleteKudoDialog({ kudoId, open, onOpenChange, onDeleted }: Props) {
  const qc = useQueryClient();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const removeFromCache = () => removeCachedKudo(qc, kudoId);

  const mutation = useMutation({
    mutationFn: () => api<void>(`/api/kudos/${kudoId}`, { method: "DELETE", body: JSON.stringify({ password }) }),
    onSuccess: () => {
      removeFromCache();
      qc.invalidateQueries({ queryKey: BOARD_KEY });
      toast.success("Kudo를 삭제했어요");
      onOpenChange(false);
      onDeleted?.();
    },
    onError: (e) => {
      if (e instanceof ApiError && e.fieldErrors?.password) return setError(e.fieldErrors.password[0]);
      toast.error(e.message);
      // 비밀번호가 틀리면 창을 열어 둔 채 비밀번호 칸 아래에도 남긴다.
      if (isInvalidPassword(e)) setError(e.message);
      // 이미 삭제된 Kudo라면 삭제에 성공한 것과 똑같이 화면에서 지우고 이어지는 동작(Kudo Page라면 보드로 이동)을 한다.
      if (e instanceof ApiError && e.status === 404) {
        removeFromCache();
        onOpenChange(false);
        onDeleted?.();
      }
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setPassword("");
          setError(undefined);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kudo를 삭제할까요?</DialogTitle>
          <DialogDescription>삭제하면 되돌릴 수 없고, 달린 리액션도 함께 사라져요.</DialogDescription>
        </DialogHeader>
        <form
          id={`delete-${kudoId}`}
          className="grid gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            const parsed = deleteKudoSchema.safeParse({ password });
            if (!parsed.success) return setError(parsed.error.issues[0].message);
            mutation.mutate();
          }}
        >
          <Label htmlFor={`delete-password-${kudoId}`}>비밀번호 확인</Label>
          <Input
            id={`delete-password-${kudoId}`}
            type="password"
            autoComplete="current-password"
            placeholder="작성할 때 정한 비밀번호"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(undefined);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `delete-error-${kudoId}` : undefined}
            autoFocus
          />
          {error && (
            <p id={`delete-error-${kudoId}`} className="text-sm text-destructive">
              {error}
            </p>
          )}
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button type="submit" form={`delete-${kudoId}`} variant="destructive" disabled={mutation.isPending}>
            {mutation.isPending ? "삭제 중…" : "삭제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
