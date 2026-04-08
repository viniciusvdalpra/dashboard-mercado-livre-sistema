import React from "react";
import { cn } from "@/lib/utils";

interface ScoreBarProps {
  score: number;
  className?: string;
}

export function ScoreBar({ score, className }: ScoreBarProps) {
  let colorClass = "bg-destructive";
  if (score >= 80) colorClass = "bg-[#539616]";
  else if (score >= 60) colorClass = "bg-[#C6A339]";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className={cn("text-xs font-bold", colorClass.replace("bg-", "text-").replace("[", "").replace("]", ""))}>
        {score}
      </span>
    </div>
  );
}
