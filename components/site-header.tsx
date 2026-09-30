import { BoardTemperature } from "@/components/board-temperature";
import { ThemeToggle } from "@/components/theme-toggle";
import { DEVELOPER_CREDIT, SITE_NAME, SLOGAN } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight">{SITE_NAME}</h1>
          <p className="truncate text-sm text-muted-foreground">{SLOGAN}</p>
          {/* 고정 헤더에 두어 어느 페이지·스크롤 위치에서든 보인다. 좁은 화면에서도 자르지 않는다. */}
          <p className="text-xs text-muted-foreground">{DEVELOPER_CREDIT}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <BoardTemperature />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
