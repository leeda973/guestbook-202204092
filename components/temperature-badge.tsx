import { ThermometerIcon } from "lucide-react";
import { temperatureLevel, type TemperatureLevel } from "@/lib/temperature";
import { cn } from "@/lib/utils";

const LEVEL_COLOR: Record<TemperatureLevel, string> = {
  mild: "text-temp-mild",
  warm: "text-temp-warm",
  hot: "text-temp-hot",
};

export function TemperatureBadge({ value, label, className }: { value: number; label: string; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5 font-semibold tabular-nums", LEVEL_COLOR[temperatureLevel(value)], className)}
      aria-label={`${label} ${value.toFixed(1)}도`}
    >
      <ThermometerIcon className="size-3.5" aria-hidden />
      <span aria-hidden>{value.toFixed(1)}°</span>
    </span>
  );
}
