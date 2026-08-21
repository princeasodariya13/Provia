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

export function PageHeader({ title, description, breadcrumbs = [], actions, className }: PageHeaderProps) {
  return (
    <div className={cn("pb-6 border-b border-border mb-8", className)}>
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-3" aria-label="Breadcrumb">
          {breadcrumbs.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-3 h-3 text-border" />}
              {item.href ? (
                <Link href={item.href} className="hover:text-text-primary transition-colors font-medium">
                  {item.label}
                </Link>
              ) : (
                <span className="text-text-secondary font-semibold">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">{title}</h1>
          {description && (
            <p className="text-sm text-text-secondary mt-1 leading-relaxed max-w-xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
