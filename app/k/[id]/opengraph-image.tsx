import { getKudo } from "@/lib/kudos";
import { OG_SIZE, fallbackImage, kudoImage } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = `${SITE_NAME} 쿠도 카드`;

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  try {
    return await kudoImage(await getKudo((await params).id, null));
  } catch {
    // 없는 Kudo나 DB 오류여도 미리보기가 깨지지 않게 기본 이미지를 돌려준다.
    return fallbackImage();
  }
}
