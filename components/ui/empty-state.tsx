import * as React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
      "border border-border-light p-12 flex flex-col items-center text-center bg-surface-muted/30 rounded-2xl",
      className
    )}>
      {icon && (
        <div className="w-14 h-14 rounded-full bg-surface border border-border-light shadow-sm flex items-center justify-center mb-5 text-text-secondary ring-4 ring-surface-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-text-primary mb-1.5">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-3 justify-center">
        {actionLabel && (
          actionHref ? (
            <Button asChild variant="default" size="sm" className="rounded-full font-bold shadow-sm">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : onAction ? (
            <Button onClick={onAction} variant="default" size="sm" className="rounded-full font-bold shadow-sm">{actionLabel}</Button>
          ) : null
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button onClick={onSecondaryAction} variant="outline" size="sm" className="rounded-full font-bold shadow-sm bg-white">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
