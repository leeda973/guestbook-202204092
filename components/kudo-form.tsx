"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError, isInvalidPassword } from "@/lib/api-client";
import { BOARD_KEY, KUDOS_KEY, patchCachedKudo, removeCachedKudo } from "@/lib/kudo-cache";
import type { FieldErrors } from "@/lib/http";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  MESSAGE_MAX,
  clipVisible,
  createKudoSchema,
  updateKudoSchema,
  visibleLength,
  type Category,
  type KudoView,
} from "@/lib/kudo-schema";
import { CATEGORY_BG } from "@/lib/category-style";
import { cn } from "@/lib/utils";

/** 작성 폼. `kudo`를 넘기면 그 Kudo를 고치는 수정 폼이 된다(Author·비밀번호는 바꿀 수 없음). */
type FormProps = {
  kudo?: KudoView;
  onDone: () => void;
  /** 수정하려던 Kudo가 이미 삭제되었을 때(Kudo Page라면 보드로 이동) */
  onGone?: () => void;
};

export function KudoForm({ kudo, onDone, onGone }: FormProps) {
  const editing = !!kudo;
  const queryClient = useQueryClient();
  const [author, setAuthor] = useState(kudo?.author ?? "");
  const [recipient, setRecipient] = useState(kudo?.recipient ?? "");
  const [category, setCategory] = useState<Category | "">(kudo?.category ?? "");
  const [message, setMessage] = useState(kudo?.message ?? "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  // 고친 필드의 오류 문구는 바로 지운다.
  const edit = <T,>(field: string, set: (v: T) => void) => (value: T) => {
    set(value);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const mutation = useMutation({
    mutationFn: (input: unknown) =>
      editing
        ? api<KudoView>(`/api/kudos/${kudo.id}`, { method: "PATCH", body: JSON.stringify(input) })
        : api<KudoView>("/api/kudos", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: (saved) => {
      if (editing) patchCachedKudo(queryClient, saved.id, () => saved);
      // 수정으로 현재 필터에 맞지 않게 될 수도 있어 목록을 다시 불러온다.
      queryClient.invalidateQueries({ queryKey: KUDOS_KEY });
      queryClient.invalidateQueries({ queryKey: BOARD_KEY });
      toast.success(editing ? "Kudo를 수정했어요" : "Kudo를 남겼어요");
      onDone();
    },
    onError: (e) => {
      if (e instanceof ApiError && e.fieldErrors) return setErrors(e.fieldErrors);
      toast.error(e.message);
      // 비밀번호가 틀리면 토스트가 사라진 뒤에도 알 수 있게 비밀번호 칸 아래에도 남긴다.
      if (isInvalidPassword(e)) setErrors({ password: [e.message] });
      if (e instanceof ApiError && e.status === 404 && kudo) {
        removeCachedKudo(queryClient, kudo.id);
        queryClient.invalidateQueries({ queryKey: BOARD_KEY });
        onDone();
        onGone?.();
      }
    },
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const input = editing
      ? { recipient, category: category || undefined, message, password }
      : { author, recipient, category: category || undefined, message, password };
    const parsed = (editing ? updateKudoSchema : createKudoSchema).safeParse(input);
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors as FieldErrors);
      return;
    }
    setErrors({});
    mutation.mutate(input);
  }

  const error = (field: string) =>
    errors[field]?.[0] && (
      <p id={`${field}-error`} className="text-sm text-destructive">
        {errors[field][0]}
      </p>
    );

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="author">이름</Label>
          <Input id="author" placeholder="예: 다은" value={author} onChange={(e) => edit("author", setAuthor)(e.target.value)} aria-invalid={!!errors.author} disabled={editing} />
          {error("author")}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="recipient">받는 사람 (선택)</Label>
          <Input id="recipient" placeholder="예: 지영" value={recipient} onChange={(e) => edit("recipient", setRecipient)(e.target.value)} aria-invalid={!!errors.recipient} />
          {error("recipient")}
        </div>
      </div>

      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">카테고리</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {CATEGORIES.map((c) => (
            <label
              key={c}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-sm transition has-focus-visible:ring-2 has-focus-visible:ring-ring",
                category === c ? cn(CATEGORY_BG[c], "border-foreground/40 font-semibold") : "hover:bg-muted",
              )}
            >
              <input type="radio" name="category" value={c} className="sr-only" checked={category === c} onChange={() => edit("category", setCategory)(c)} />
              {CATEGORY_LABEL[c]}
            </label>
          ))}
        </div>
        {error("category")}
      </fieldset>

      <div className="grid gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="message">메시지</Label>
          <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
            {visibleLength(message)}/{MESSAGE_MAX}
          </span>
        </div>
        <Textarea
          id="message"
          rows={4}
          placeholder="따뜻한 한마디를 남겨 주세요"
          value={message}
          onChange={(e) => edit("message", setMessage)(clipVisible(e.target.value, MESSAGE_MAX))}
          aria-invalid={!!errors.message}
        />
        {error("message")}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="password">{editing ? "비밀번호 확인" : "비밀번호"}</Label>
        <Input
          id="password"
          type="password"
          autoComplete={editing ? "current-password" : "new-password"}
          placeholder={editing ? "작성할 때 정한 비밀번호" : "4~20자"}
          value={password}
          onChange={(e) => edit("password", setPassword)(e.target.value)}
          aria-invalid={!!errors.password}
        />
        {!editing && (
          <p className="text-xs text-muted-foreground">수정·삭제할 때 필요해요. 잊어버리면 수정·삭제할 수 없어요.</p>
        )}
        {error("password")}
      </div>

      <Button type="submit" size="lg" disabled={mutation.isPending}>
        {mutation.isPending ? "저장 중…" : editing ? "수정하기" : "Kudo 남기기"}
      </Button>
    </form>
  );
}
