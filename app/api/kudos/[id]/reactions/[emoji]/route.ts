import { handle } from "@/lib/http";
import { setReaction } from "@/lib/kudos";
import { ensureVisitor } from "@/lib/visitor";

type Context = RouteContext<"/api/kudos/[id]/reactions/[emoji]">;

function reactionHandler(on: boolean) {
  return (request: Request, { params }: Context) =>
    handle(async () => {
      const visitor = ensureVisitor(request);
      const state = await setReaction(await params, visitor.id, on);
      const res = Response.json(state);
      if (visitor.setCookie) res.headers.append("set-cookie", visitor.setCookie);
      return res;
    });
}

export const PUT = reactionHandler(true);
export const DELETE = reactionHandler(false);
