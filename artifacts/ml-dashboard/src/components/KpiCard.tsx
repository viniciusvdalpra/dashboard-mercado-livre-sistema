import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function KpiCard({ label, value, subtext, icon, trend, className }: KpiCardProps) {
  return (
    <Card className={cn("overflow-hidden card-hover", className)}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
          {trend && (
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-destructive"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
          )}
        </div>
        {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
      </CardContent>
    </Card>
  );
}
