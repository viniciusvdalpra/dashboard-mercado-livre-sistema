import { cn } from "@/lib/utils";

interface PageAction {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline";
  testId?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: PageAction[];
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div>
        <h2 className="text-base font-bold text-foreground tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action, i) =>
            action.variant === "primary" ? (
              <button
                key={i}
                onClick={action.onClick}
                data-testid={action.testId}
                className="flex items-center gap-2 h-9 px-4 text-sm font-semibold text-white rounded-xl transition-all"
                style={{
                  background: "linear-gradient(135deg, hsl(174 55% 26%), hsl(174 65% 34%))",
                  boxShadow: "0 4px 14px hsl(174 72% 36% / .28)",
                }}
              >
                {action.icon}{action.label}
              </button>
            ) : (
              <button
                key={i}
                onClick={action.onClick}
                data-testid={action.testId}
                className="flex items-center gap-2 h-9 px-4 text-sm font-semibold text-foreground bg-white rounded-xl border border-border hover:bg-muted transition-colors"
              >
                {action.icon}{action.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
