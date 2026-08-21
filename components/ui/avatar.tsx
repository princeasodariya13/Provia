import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({ src, alt = "Avatar", fallback = "U", size = "md", className, ...props }: AvatarProps) {
  const [error, setError] = React.useState(false);

  const sizeMap = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
  };

  const initials = fallback
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "P";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center bg-surface-muted border border-border text-text-primary font-bold overflow-hidden select-none shrink-0",
        sizeMap[size],
        className
      )}
      {...props}
    >
      {src && !error ? (
        <Image src={src} alt={alt} fill sizes="96px" className="object-cover" onError={() => setError(true)} />
      ) : (
        <span className="text-brand tracking-tight">{initials}</span>
      )}
    </div>
  );
}
