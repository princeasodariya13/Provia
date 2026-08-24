import React from "react";
import { CheckCircle2, Circle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CheckItem {
  id: string;
  label: string;
  passed: boolean;
  actionLabel: string;
  actionUrl: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  checks: CheckItem[];
}

export function ReadinessModal({ isOpen, onClose, checks }: Props) {
  if (!isOpen) return null;

  const passedCount = checks.filter(c => c.passed).length;
  const totalCount = checks.length;
  const percentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  const failedChecks = checks.filter(c => !c.passed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-border-light rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border-light relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-text-primary mb-1">Complete your profile first</h2>
          <p className="text-sm text-text-secondary">
            Your portfolio template is ready. Complete a few more steps before generating.
          </p>
        </div>

        {/* Progress */}
        <div className="p-6 bg-surface-muted/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-text-primary">Portfolio Readiness</span>
            <span className="text-sm font-bold text-brand">{percentage}%</span>
          </div>
          <div className="w-full bg-border-light rounded-full h-2 mb-6 overflow-hidden">
            <div
              className="bg-brand h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="space-y-3">
            {checks.map(check => (
              <div key={check.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {check.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-text-muted shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${check.passed ? "text-text-secondary line-through" : "text-text-primary"}`}>
                    {check.label}
                  </span>
                </div>
                {!check.passed && (
                  <Button variant="outline" size="sm" asChild className="h-7 text-xs font-bold ml-2 shrink-0">
                    <Link href={check.actionUrl} onClick={onClose}>
                      {check.actionLabel}
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Failed checks quick actions */}
        {failedChecks.length > 0 && (
          <div className="px-6 pb-2 pt-4 border-t border-border-light">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              {failedChecks.map(check => (
                <Button key={check.id} variant="outline" size="sm" asChild className="h-8 text-xs font-bold">
                  <Link href={check.actionUrl} onClick={onClose}>
                    {check.actionLabel}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-border-light flex justify-end">
          <Button onClick={onClose} className="bg-text-primary text-background hover:bg-text-primary/90 font-bold">
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
