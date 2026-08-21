import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: { value: string; positive?: boolean };
  className?: string;
}

export function StatCard({ title, value, subtext, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("border-border bg-surface-muted hover:border-border-strong transition-colors", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between pb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            {title}
          </span>
          {icon && <span className="text-text-muted">{icon}</span>}
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold tracking-tight text-text-primary">{value}</div>
          {trend && (
            <span className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 border",
              trend.positive
                ? "bg-success-muted border-success text-success"
                : "bg-error-muted border-error text-error"
            )}>
              {trend.value}
            </span>
          )}
        </div>
        {subtext && (
          <p className="text-xs text-text-muted mt-1.5">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}
