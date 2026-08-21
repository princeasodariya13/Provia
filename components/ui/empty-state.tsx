import * as React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionHref,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "border border-dashed border-border p-10 flex flex-col items-center text-center bg-surface-muted/40",
      className
    )}>
      {icon && (
        <div className="w-10 h-10 border border-border bg-background flex items-center justify-center mb-4 text-text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-text-primary mb-1.5">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-3 justify-center">
        {actionLabel && (
          actionHref ? (
            <Button asChild variant="default" size="sm">
              <a href={actionHref}>{actionLabel}</a>
            </Button>
          ) : onAction ? (
            <Button onClick={onAction} variant="default" size="sm">{actionLabel}</Button>
          ) : null
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button onClick={onSecondaryAction} variant="outline" size="sm">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
