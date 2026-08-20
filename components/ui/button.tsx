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
          "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-semibold tracking-wide ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-brand text-white hover:bg-brand-hover": variant === "default",
            "bg-border-light text-text-primary hover:bg-taupe hover:text-white": variant === "secondary",
            "border border-border-strong bg-transparent hover:bg-taupe hover:text-white": variant === "outline",
            "hover:bg-background hover:text-text-primary": variant === "ghost",
            "bg-error text-white hover:bg-error/90": variant === "destructive",
            "text-brand underline-offset-4 hover:underline": variant === "link",
            "h-10 px-6 py-2": size === "default",
            "h-9 px-4": size === "sm",
            "h-14 px-10 text-base": size === "lg",
            "h-10 w-10": size === "icon",
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
