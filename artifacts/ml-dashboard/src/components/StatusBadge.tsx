import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  healthy: { label: "Saudável", className: "bg-green-50 text-green-700 border border-green-200" },
  warning: { label: "Atenção", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  unhealthy: { label: "Unhealthy", className: "bg-red-50 text-red-700 border border-red-200" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? { label: status, className: "bg-muted text-muted-foreground border border-border" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", config.className, className)}>
      {config.label}
    </span>
  );
}
