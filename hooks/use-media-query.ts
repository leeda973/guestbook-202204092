import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** 보드 열 수: 768px 미만 1열, 1024px 미만 2열, 그 이상 3열. 서버 렌더와 첫 화면은 1열이다. */
export function useColumnCount() {
  const md = useMediaQuery("(min-width: 768px)");
  const lg = useMediaQuery("(min-width: 1024px)");
  return lg ? 3 : md ? 2 : 1;
}
