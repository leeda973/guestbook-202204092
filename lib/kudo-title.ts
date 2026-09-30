import { SITE_NAME } from "@/lib/site";
import { CATEGORY_LABEL, clipVisible, visibleLength, type KudoView } from "@/lib/kudo-schema";

/** 탭·미리보기 제목. 예: "지영님에게 온 감사 Kudo · Mini Kudos" */
export function kudoTitle(kudo: Pick<KudoView, "recipient" | "category">) {
  const who = kudo.recipient ? `${kudo.recipient}님에게 온` : "모두에게 남긴";
  return `${who} ${CATEGORY_LABEL[kudo.category]} Kudo · ${SITE_NAME}`;
}

/** 보이는 글자 기준으로 max자까지 자르고, 잘렸으면 "…"을 붙인다. */
export function excerpt(text: string, max: number) {
  return visibleLength(text) > max ? `${clipVisible(text, max)}…` : text;
}
