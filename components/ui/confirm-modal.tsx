"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  children?: React.ReactNode;
  isConfirmDisabled?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  children,
  isConfirmDisabled = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm animate-in fade-in duration-200" style={{ zIndex: 999999 }}>
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md mx-4 bg-surface border border-border-light rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-5">
            <div className={`p-3.5 rounded-full shrink-0 ${variant === 'danger' ? 'bg-error/10 text-error' : 'bg-brand/10 text-brand'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-extrabold text-text-primary mb-2 tracking-tight">{title}</h2>
              <p className="text-sm text-text-secondary leading-relaxed font-medium">{description}</p>
              {children && <div className="mt-6">{children}</div>}
            </div>
          </div>
        </div>
        <div className="p-5 sm:p-6 bg-surface-muted/20 border-t border-border-light flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-full shadow-sm font-bold bg-surface hover:bg-surface-muted">
            {cancelText}
          </Button>
          <Button 
            onClick={() => {
              if (isConfirmDisabled) return;
              onConfirm();
              onClose();
            }}
            disabled={isConfirmDisabled}
            className={`rounded-full shadow-sm font-bold ${variant === 'danger' ? 'bg-error hover:bg-error-strong text-white' : 'bg-brand hover:bg-brand-hover'}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
