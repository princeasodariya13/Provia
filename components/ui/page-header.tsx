import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [{ label: "Workspace", href: "/dashboard" }],
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-3 pb-6 border-b border-border-light/60 mb-8", className)}>
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-secondary">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-muted" />}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-brand transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-text-primary font-semibold">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            {title}
          </h1>
          {description && (
            <p className="text-text-secondary text-sm font-medium mt-1">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
