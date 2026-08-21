import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40",
          {
            /* Primary — brand crimson */
            "bg-brand text-white hover:bg-brand-hover": variant === "default",
            /* Secondary — warm surface */
            "bg-surface-muted text-text-primary border border-border hover:bg-surface-hover": variant === "secondary",
            /* Outline — thin black border editorial */
            "border border-border-strong bg-transparent text-text-primary hover:bg-surface-muted": variant === "outline",
            /* Ghost — minimal */
            "text-text-secondary hover:text-text-primary hover:bg-surface-muted": variant === "ghost",
            /* Destructive */
            "bg-error text-white hover:bg-error/90": variant === "destructive",
            /* Link */
            "text-brand underline-offset-4 hover:underline p-0": variant === "link",
            /* Sizes */
            "h-10 px-6 py-2": size === "default",
            "h-8 px-4 text-xs": size === "sm",
            "h-12 px-8 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
