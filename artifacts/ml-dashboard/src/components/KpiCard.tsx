import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { useLocation } from "wouter";

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean; label?: string };
  accent?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function KpiCard({ label, value, subtext, icon, trend, accent, href, onClick, className }: KpiCardProps) {
  const [, navigate] = useLocation();
  const isClickable = !!(href || onClick);

  const handleClick = () => {
    if (href) navigate(href);
    else if (onClick) onClick();
  };

  if (accent) {
    return (
      <div
        className={cn("rounded-2xl p-5 relative overflow-hidden select-none flex flex-col", isClickable && "cursor-pointer", className)}
        style={{
          background: "linear-gradient(135deg, hsl(174 55% 22%) 0%, hsl(174 65% 30%) 100%)",
          boxShadow: "0 8px 24px hsl(174 72% 36% / .25)",
          transition: "box-shadow .15s, transform .15s",
        }}
        onClick={isClickable ? handleClick : undefined}
        onMouseEnter={e => { if (isClickable) { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px hsl(174 72% 36% / .38)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"; } }}
        onMouseLeave={e => { if (isClickable) { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px hsl(174 72% 36% / .25)"; (e.currentTarget as HTMLDivElement).style.transform = ""; } }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-10 bg-white" />
        </div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <p className="text-teal-200 text-xs font-semibold uppercase tracking-wide min-h-[2.5rem] leading-tight">{label}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              {icon && (
                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/15 text-white">
                  {icon}
                </div>
              )}
              {isClickable && (
                <div className="h-6 w-6 rounded-lg flex items-center justify-center bg-white/15 text-white/70">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          </div>
          <p className="text-white text-3xl font-bold tracking-tight mb-2">{value}</p>
          <div className="mt-auto">
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
            {subtext && !trend && <p className="text-teal-200/60 text-xs">{subtext}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-5 border border-border transition-all duration-150 select-none flex flex-col",
        isClickable
          ? "group cursor-pointer hover:border-primary/30 hover:-translate-y-0.5"
          : "card-hover",
        className
      )}
      style={{
        boxShadow: "0 1px 4px rgb(0 0 0 / .06), 0 1px 2px rgb(0 0 0 / .04)",
      }}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide leading-tight min-h-[2.5rem]">{label}</p>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {icon && (
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "hsl(174 72% 36% / .10)", color: "hsl(174 55% 32%)" }}
            >
              {icon}
            </div>
          )}
          {isClickable && (
            <div
              className="h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "hsl(174 72% 36% / .08)", color: "hsl(174 55% 32%)" }}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      <div className="mt-auto pt-2">
        {trend && (
          <div className="flex items-center gap-1.5">
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
        {subtext && !trend && <p className="text-muted-foreground text-xs">{subtext}</p>}
        {isClickable && (
          <p className="text-[10px] text-primary/60 font-semibold uppercase tracking-wide flex items-center gap-1 mt-1.5">
            Ver detalhes <ArrowUpRight className="h-3 w-3" />
          </p>
        )}
      </div>
    </div>
  );
}
