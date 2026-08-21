"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-6 bg-surface border border-border-strong my-8">
      <div className="w-12 h-12 bg-error/10 border border-error text-error flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        Something went wrong
      </h2>
      <p className="text-text-secondary text-sm max-w-md mb-6">
        We encountered an error while loading this section of your workspace.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={() => reset()} variant="default" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Go to Overview
          </Link>
        </Button>
      </div>
    </div>
  );
}
