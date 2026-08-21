import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "error" | "brand";
  size?: "sm" | "md";
}

export function Badge({ className, variant = "default", size = "md", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold tracking-wider uppercase border transition-colors",
        {
          "bg-surface-muted border-border text-text-secondary":        variant === "default",
          "bg-surface-muted border-border-light text-text-muted":      variant === "secondary",
          "border-border-strong text-text-primary bg-transparent":     variant === "outline",
          "bg-success-muted border-success text-success":              variant === "success",
          "bg-warning-muted border-warning text-warning":              variant === "warning",
          "bg-error-muted border-error text-error":                    variant === "error",
          "bg-brand text-white border-brand":                          variant === "brand",
          "px-2 py-0.5 text-[9px]":   size === "sm",
          "px-2.5 py-0.5 text-[10px]": size === "md",
        },
        className
      )}
      {...props}
    />
  );
}
