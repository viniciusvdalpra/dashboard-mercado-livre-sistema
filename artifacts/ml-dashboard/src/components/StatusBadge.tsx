import React from "react";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: "healthy" | "warning" | "unhealthy" | string;
  curve?: "A" | "B" | "C" | string;
  children: React.ReactNode;
}

export function StatusBadge({ status, curve, children, className, ...props }: StatusBadgeProps) {
  let badgeClass = "";

  if (status) {
    if (status === "healthy") badgeClass = "status-healthy";
    else if (status === "warning") badgeClass = "status-warning";
    else if (status === "unhealthy") badgeClass = "status-unhealthy";
    else badgeClass = "bg-muted text-muted-foreground";
  }

  if (curve) {
    if (curve === "A") badgeClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    else if (curve === "B") badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    else if (curve === "C") badgeClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }

  return (
    <ShadcnBadge
      variant="outline"
      className={cn("border-none font-medium px-2 py-0.5", badgeClass, className)}
      {...props}
    >
      {children}
    </ShadcnBadge>
  );
}
