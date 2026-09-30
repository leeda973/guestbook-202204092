import type { Metadata } from "next";

/** 절대 주소가 필요한 메타데이터(미리보기 이미지 등)의 기준 주소. Vercel 운영 도메인 → 배포 주소 → 로컬 순. */
export function siteUrl() {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return new URL(host ? `https://${host}` : `http://localhost:${process.env.PORT ?? 3000}`);
}

export const SITE_NAME = "Mini Kudos";
export const SLOGAN = "가볍게 전하는 응원, 함께 따뜻해지는 공간";

/** 과제 요구사항: UI에 개발자 이름과 학번을 표시한다. */
export const DEVELOPER_NAME = "이다은";
export const STUDENT_ID = "202204092";
export const DEVELOPER_CREDIT = `만든 사람 · ${DEVELOPER_NAME} (${STUDENT_ID})`;

/**
 * 공유 미리보기 메타데이터. 하위 페이지가 openGraph·twitter를 정의하면 루트 값을 통째로 덮어쓰므로,
 * 페이지마다 이 함수로 만들어 사이트 이름·언어·큰 이미지 카드 설정을 잃지 않게 한다.
 */
export function sharePreview(title: string, description: string): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: { title, description, type: "website", locale: "ko_KR", siteName: SITE_NAME },
    twitter: { card: "summary_large_image", title, description },
  };
}
