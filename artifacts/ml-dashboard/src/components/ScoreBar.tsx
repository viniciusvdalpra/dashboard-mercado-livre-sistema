import { cn } from "@/lib/utils";

interface ScoreBarProps {
  value: number;
  showLabel?: boolean;
  className?: string;
}

export function ScoreBar({ value, showLabel = false, className }: ScoreBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 80 ? "#539616" : pct >= 60 ? "#C6A339" : "#A60808";

  return (
    <div className={cn("flex items-center gap-2 flex-1", className)}>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold w-6 text-right" style={{ color }}>
          {value}
        </span>
      )}
    </div>
  );
}
