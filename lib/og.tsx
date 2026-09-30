// 메신저 미리보기 이미지(1200×630). 한글은 Google Fonts에서 필요한 글자만 받아 그린다.
import { ImageResponse } from "next/og";
import { CATEGORY_LABEL, type Category, type KudoView } from "@/lib/kudo-schema";
import { excerpt } from "@/lib/kudo-title";
import { SITE_NAME, SLOGAN } from "@/lib/site";
import { temperatureLevel, type TemperatureLevel } from "@/lib/temperature";

export const OG_SIZE = { width: 1200, height: 630 };

// 이미지 렌더러는 CSS 변수와 oklch를 모르므로 hex로 둔다(globals.css의 라이트 모드 토큰과 같은 톤).
const CATEGORY_HEX: Record<Category, string> = {
  cheer: "#fde5c4",
  feedback: "#dbe8fb",
  thanks: "#d6f2de",
  praise: "#fbdbe7",
};
const TEMP_HEX: Record<TemperatureLevel, string> = { mild: "#2f9357", warm: "#cf7f12", hot: "#d2402e" };
const INK = "#1c1917";
const MUTED = "#57534e";
const CREAM = "#fff7ed";
/** 온도 숫자는 값마다 달라지므로 숫자·기호 전체를 폰트 글자 목록에 넣는다. */
const NUMBER_GLYPHS = "0123456789.°";

/** 이미지에 들어갈 글자만 담은 Noto Sans KR 폰트. 받지 못하면 null. */
async function koreanFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl, { signal: AbortSignal.timeout(3000) })).text();
    const fontUrl = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype|woff)'\)/)?.[1];
    if (!fontUrl) return null;
    const res = await fetch(fontUrl, { signal: AbortSignal.timeout(3000) });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

async function render(node: React.ReactElement, text: string) {
  const font = await koreanFont(text);
  if (!font) return fallbackImage();
  return new ImageResponse(node, {
    ...OG_SIZE,
    fonts: [{ name: "Noto Sans KR", data: font, weight: 700, style: "normal" }],
  });
}

/** 한글 폰트 없이도 그릴 수 있는 로고만 있는 기본 이미지. */
export function fallbackImage() {
  return new ImageResponse(
    (
      <div style={{ ...frame, background: CREAM, alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 110, fontWeight: 700, color: INK }}>{SITE_NAME}</div>
      </div>
    ),
    OG_SIZE,
  );
}

const frame = { width: "100%", height: "100%", display: "flex", flexDirection: "column" as const, padding: 72 };

function Temperature({ value, size }: { value: number; size: number }) {
  return <div style={{ fontSize: size, color: TEMP_HEX[temperatureLevel(value)] }}>{`🌡️ ${value.toFixed(1)}°`}</div>;
}

export function kudoImage(kudo: KudoView) {
  const message = excerpt(kudo.message, 80);
  const label = CATEGORY_LABEL[kudo.category];
  const to = kudo.recipient ? `To. ${kudo.recipient}` : "";
  const from = `From. ${kudo.author}`;
  return render(
    <div style={{ ...frame, background: CATEGORY_HEX[kudo.category], color: INK, justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 32 }}>
        <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 999, padding: "8px 28px" }}>{label}</div>
        <div style={{ color: MUTED }}>{SITE_NAME}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {to && <div style={{ fontSize: 44 }}>{to}</div>}
        <div style={{ fontSize: 54, lineHeight: 1.35, wordBreak: "keep-all" }}>{message}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 36 }}>
        <div style={{ color: MUTED }}>{from}</div>
        <Temperature value={kudo.temperature} size={40} />
      </div>
    </div>,
    [label, SITE_NAME, to, message, from, NUMBER_GLYPHS].join(""),
  );
}

export function boardImage(temperature: number) {
  return render(
    <div style={{ ...frame, background: CREAM, color: INK, justifyContent: "center", gap: 28 }}>
      <div style={{ fontSize: 120 }}>{SITE_NAME}</div>
      <div style={{ fontSize: 48, color: MUTED, wordBreak: "keep-all" }}>{SLOGAN}</div>
      <div style={{ display: "flex", gap: 16, fontSize: 44, marginTop: 24 }}>
        <div style={{ color: MUTED }}>우리 보드 온도</div>
        <Temperature value={temperature} size={44} />
      </div>
    </div>,
    [SITE_NAME, SLOGAN, "우리 보드 온도", NUMBER_GLYPHS].join(""),
  );
}
