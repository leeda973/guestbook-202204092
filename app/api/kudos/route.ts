import { createKudo, listKudos } from "@/lib/kudos";
import { clientIp, handle, readJson } from "@/lib/http";
import { visitorFromRequest } from "@/lib/visitor";

export async function GET(request: Request) {
  return handle(async () => {
    const params = new URL(request.url).searchParams;
    return Response.json(await listKudos(Object.fromEntries(params), visitorFromRequest(request)));
  });
}

export async function POST(request: Request) {
  return handle(async () => Response.json(await createKudo(await readJson(request), clientIp(request)), { status: 201 }));
}
