import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

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
    <div
      className={cn(
        "border border-dashed border-border-strong p-8 md:p-12 text-center flex flex-col items-center justify-center bg-surface/30",
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 bg-surface border border-border-strong flex items-center justify-center mb-4 text-brand">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {actionLabel && (actionHref ? (
          <Button asChild variant="default" size="default">
            <a href={actionHref}>{actionLabel}</a>
          </Button>
        ) : onAction ? (
          <Button onClick={onAction} variant="default" size="default">
            {actionLabel}
          </Button>
        ) : null)}
        {secondaryActionLabel && onSecondaryAction && (
          <Button onClick={onSecondaryAction} variant="outline" size="default">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
