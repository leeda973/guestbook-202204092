"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { BOARD_KEY, KUDOS_KEY, kudoKey, patchCachedKudo } from "@/lib/kudo-cache";
import { kudoTemperature } from "@/lib/temperature";
import {
  EMOJIS,
  EMOJI_CHAR,
  EMOJI_NAME,
  totalReactions,
  type Emoji,
  type KudoView,
  type ReactionResult,
  type ReactionState,
} from "@/lib/kudo-schema";
import { cn } from "@/lib/utils";

function ReactionButton({ kudoId, emoji, state }: { kudoId: number; emoji: Emoji; state: ReactionState }) {
  const qc = useQueryClient();
  // 이 버튼의 상태를 바꾼다. 온도를 주지 않으면(낙관적 갱신·롤백) 같은 공식으로 다시 계산한다.
  const setState = (next: ReactionState, temperature?: number) =>
    patchCachedKudo(qc, kudoId, (k) => {
      const reactions = { ...k.reactions, [emoji]: next };
      return { ...k, reactions, temperature: temperature ?? kudoTemperature(totalReactions(reactions)) };
    });

  const mutation = useMutation({
    mutationFn: (on: boolean) =>
      api<ReactionResult>(`/api/kudos/${kudoId}/reactions/${emoji}`, { method: on ? "PUT" : "DELETE" }),
    onMutate: async (on) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: KUDOS_KEY }),
        qc.cancelQueries({ queryKey: kudoKey(kudoId) }),
      ]);
      // 누르는 즉시 숫자를 바꾼다(Optimistic UI). 실패하면 이 버튼의 이전 상태로만 되돌린다.
      const previous = state;
      setState({ count: Math.max(0, previous.count + (on ? 1 : -1)), reacted: on });
      return { previous };
    },
    onError: (e, _on, ctx) => {
      if (ctx) setState(ctx.previous);
      toast.error(e.message);
    },
    onSuccess: ({ count, reacted, temperature }) => {
      // 서버가 돌려준 값으로 확정한다.
      setState({ count, reacted }, temperature);
      qc.invalidateQueries({ queryKey: BOARD_KEY });
    },
  });

  return (
    <button
      type="button"
      aria-pressed={state.reacted}
      aria-label={`${EMOJI_NAME[emoji]} 리액션 ${state.count}개`}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate(!state.reacted)}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm tabular-nums transition",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-70",
        state.reacted
          ? "border-foreground/40 bg-background font-semibold"
          : "border-transparent bg-background/40 hover:bg-background/70",
      )}
    >
      <span aria-hidden>{EMOJI_CHAR[emoji]}</span>
      <span aria-hidden>{state.count}</span>
    </button>
  );
}

export function ReactionBar({ kudo }: { kudo: KudoView }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="리액션">
      {EMOJIS.map((emoji) => (
        <ReactionButton key={emoji} kudoId={kudo.id} emoji={emoji} state={kudo.reactions[emoji]} />
      ))}
    </div>
  );
}
