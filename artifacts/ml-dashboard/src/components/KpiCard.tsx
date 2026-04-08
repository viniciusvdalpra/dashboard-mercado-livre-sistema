import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean; label?: string };
  accent?: boolean;
  className?: string;
}

export function KpiCard({ label, value, subtext, icon, trend, accent, className }: KpiCardProps) {
  if (accent) {
    return (
      <div
        className={cn("rounded-2xl p-5 relative overflow-hidden", className)}
        style={{
          background: "linear-gradient(135deg, hsl(174 55% 22%) 0%, hsl(174 65% 30%) 100%)",
          boxShadow: "0 8px 24px hsl(174 72% 36% / .25)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-10 bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <p className="text-teal-200 text-xs font-semibold uppercase tracking-wide">{label}</p>
            {icon && (
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/15 text-white">
                {icon}
              </div>
            )}
          </div>
          <p className="text-white text-3xl font-bold tracking-tight mb-2">{value}</p>
          {trend && (
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                trend.isPositive ? "bg-white/20 text-white" : "bg-red-400/30 text-red-100"
              )}>
                {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {trend.isPositive ? "+" : ""}{trend.value}%
              </div>
              <span className="text-teal-200/70 text-xs">{trend.label ?? "vs ontem"}</span>
            </div>
          )}
          {subtext && !trend && <p className="text-teal-200/60 text-xs mt-1">{subtext}</p>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-5 border border-border card-hover",
        className
      )}
      style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .06), 0 1px 2px rgb(0 0 0 / .04)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">{label}</p>
        {icon && (
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "hsl(174 72% 36% / .10)", color: "hsl(174 55% 32%)" }}
          >
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      {trend && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
            trend.isPositive ? "trend-up" : "trend-down"
          )}>
            {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend.isPositive ? "+" : ""}{trend.value}%
          </div>
          <span className="text-muted-foreground text-xs">{trend.label ?? "vs ontem"}</span>
        </div>
      )}
      {subtext && !trend && <p className="text-muted-foreground text-xs mt-1.5">{subtext}</p>}
    </div>
  );
}
