// 작성 시각 표시: 상대 시간("3분 전")과 한국 시간 기준의 정확한 시각.
const rtf = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });
// 정확한 시각은 서버(UTC)와 브라우저가 같은 문자열을 그리도록 한국 시간으로 고정한다.
const kst = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function kstParts(iso: string | number) {
  const parts = Object.fromEntries(kst.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  return { year: parts.year, month: parts.month, day: parts.day, weekday: parts.weekday, time: `${parts.hour}:${parts.minute}` };
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "3분 전", "어제" 같은 상대 시간. 1분 미만은 "방금 전". */
export function relativeTime(iso: string, now = Date.now()) {
  const seconds = (new Date(iso).getTime() - now) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "방금 전";
}

/** 한국 시간의 작성 시각. 올해면 "9월 30일 14:05", 아니면 "2025년 12월 31일 23:59". */
export function koreanDateTime(iso: string, now = Date.now()) {
  const t = kstParts(iso);
  const date = `${t.month}월 ${t.day}일 ${t.time}`;
  return t.year === kstParts(now).year ? date : `${t.year}년 ${date}`;
}

/** 마우스를 올렸을 때 보이는 전체 시각. 예: "2026년 9월 30일 수요일 14:05" */
export function koreanFullDateTime(iso: string) {
  const t = kstParts(iso);
  return `${t.year}년 ${t.month}월 ${t.day}일 ${t.weekday} ${t.time}`;
}
