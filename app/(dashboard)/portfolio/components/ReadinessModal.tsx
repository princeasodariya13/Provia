import React from "react";
import { CheckCircle2, Circle, ArrowRight, X } from "lucide-react";
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
  const percentage = Math.round((passedCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border-light rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border-light relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold text-text-primary mb-2">Build your professional portfolio</h2>
          <p className="text-sm text-text-secondary">
            Your template is ready, but we need a little more information before we can generate your portfolio.
          </p>
        </div>
        
        <div className="p-6 bg-surface-muted/30">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-bold text-text-primary">Portfolio readiness</span>
            <span className="text-sm font-bold text-brand">{percentage}%</span>
          </div>
          
          <div className="w-full bg-border-light rounded-full h-2 mb-8 overflow-hidden">
            <div 
              className="bg-brand h-2 rounded-full transition-all duration-500" 
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="space-y-4">
            {checks.map(check => (
              <div key={check.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  {check.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <Circle className="w-5 h-5 text-text-muted" />
                  )}
                  <span className={`text-sm font-medium ${check.passed ? "text-text-secondary line-through" : "text-text-primary"}`}>
                    {check.label}
                  </span>
                </div>
                {!check.passed && (
                  <Button variant="outline" size="sm" asChild className="h-7 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={check.actionUrl}>
                      {check.actionLabel}
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6 border-t border-border-light flex justify-end">
          <Button variant="default" onClick={onClose} className="bg-text-primary text-background hover:bg-text-primary/90 font-bold">
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
