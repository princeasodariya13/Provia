import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtext,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("rounded-none border-border-strong bg-background hover:border-brand/50 transition-colors", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">
            {title}
          </span>
          {icon && <div className="text-brand">{icon}</div>}
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <div className="text-3xl font-bold tracking-tight text-text-primary">
            {value}
          </div>
          {trend && (
            <span
              className={cn(
                "text-xs font-bold px-1.5 py-0.5 border",
                trend.positive
                  ? "bg-success/10 border-success text-success"
                  : "bg-error/10 border-error text-error"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
        {subtext && (
          <p className="text-xs text-text-secondary mt-2 font-medium">
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
