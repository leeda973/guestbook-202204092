import { connection } from "next/server";
import { getBoardStats } from "@/lib/kudos";
import { OG_SIZE, boardImage, fallbackImage } from "@/lib/og";
import { SITE_NAME, SLOGAN } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = `${SITE_NAME} — ${SLOGAN}`;

export default async function Image() {
  // 빌드 시점이 아니라 요청 시점의 보드 온도를 그린다.
  await connection();
  try {
    return await boardImage((await getBoardStats()).temperature);
  } catch {
    return fallbackImage();
  }
}
