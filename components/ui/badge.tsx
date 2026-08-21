import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "error" | "brand";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center font-bold tracking-wider uppercase transition-colors border",
        {
          "bg-surface border-border-strong text-text-primary": variant === "default",
          "bg-surface-muted border-border-light text-text-secondary": variant === "secondary",
          "border-border-strong text-text-primary bg-transparent": variant === "outline",
          "bg-success/15 border-success text-success": variant === "success",
          "bg-warning/15 border-warning text-warning": variant === "warning",
          "bg-error/15 border-error text-error": variant === "error",
          "bg-brand text-white border-brand": variant === "brand",
          "px-2 py-0.5 text-[10px]": size === "sm",
          "px-2.5 py-1 text-xs": size === "md",
        },
        className
      )}
      {...props}
    />
  );
}
