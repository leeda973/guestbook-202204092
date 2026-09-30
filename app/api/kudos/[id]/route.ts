import { clientIp, handle, readJson } from "@/lib/http";
import { deleteKudo, getKudo, updateKudo } from "@/lib/kudos";
import { visitorFromRequest } from "@/lib/visitor";

type Context = RouteContext<"/api/kudos/[id]">;

export async function GET(request: Request, { params }: Context) {
  return handle(async () => {
    const { id } = await params;
    return Response.json(await getKudo(id, visitorFromRequest(request)));
  });
}

export async function PATCH(request: Request, { params }: Context) {
  return handle(async () => {
    const { id } = await params;
    return Response.json(await updateKudo(id, await readJson(request), visitorFromRequest(request), clientIp(request)));
  });
}

export async function DELETE(request: Request, { params }: Context) {
  return handle(async () => {
    const { id } = await params;
    await deleteKudo(id, await readJson(request), clientIp(request));
    return new Response(null, { status: 204 });
  });
}
