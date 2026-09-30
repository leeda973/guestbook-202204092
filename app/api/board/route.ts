import { handle } from "@/lib/http";
import { getBoardStats } from "@/lib/kudos";

export async function GET() {
  return handle(async () => Response.json(await getBoardStats()));
}
