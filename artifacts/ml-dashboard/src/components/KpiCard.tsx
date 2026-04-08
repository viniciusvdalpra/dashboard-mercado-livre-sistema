import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  highlight?: boolean;
  className?: string;
}

export function KpiCard({ label, value, subtext, icon, trend, highlight, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl bg-white border border-border p-5 card-hover overflow-hidden group",
        highlight && "border-primary/30",
        className
      )}
      style={{ boxShadow: "0 1px 3px rgb(0 0 0 / .06), 0 1px 2px rgb(0 0 0 / .04)" }}
    >
      {highlight && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ background: "hsl(43 75% 48% / .03)" }}
        />
      )}
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-none">
          {label}
        </p>
        {icon && (
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "hsl(43 75% 48% / .10)", color: "hsl(43 75% 42%)" }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground tracking-tight leading-none">
          {value}
        </span>
        {trend && (
          <span className={cn("text-xs font-semibold", trend.isPositive ? "text-green-600" : "text-red-600")}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      {subtext && (
        <p className="mt-1.5 text-xs text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
}
