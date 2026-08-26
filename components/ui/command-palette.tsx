/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  FileText,
  Globe,
  BarChart3,
  GitBranch,
  Settings,
  Upload,
  Sparkles,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  const actions = React.useMemo(() => [
    {
      group: "Navigation",
      items: [
        { label: "Go to Overview", icon: Sparkles, href: "/dashboard" },
        { label: "Go to Profile Workspace", icon: User, href: "/profile" },
        { label: "Go to Resume Intelligence", icon: FileText, href: "/profile?tab=resume" },
        { label: "Go to Portfolio Engine", icon: Globe, href: "/portfolio" },
        { label: "Go to Analytics", icon: BarChart3, href: "/analytics" },
        { label: "Go to Integrations", icon: GitBranch, href: "/integrations" },
        { label: "Go to Account Settings", icon: Settings, href: "/settings" },
      ],
    },
    {
      group: "Quick Actions",
      items: [
        { label: "Upload New Resume", icon: Upload, href: "/profile?upload=resume" },
        { label: "Edit Profile Info", icon: User, href: "/profile" },
        { label: "Generate Portfolio Document", icon: Globe, href: "/portfolio" },
        { label: "View Live Portfolio", icon: Globe, href: "/portfolio" },
        { label: "Export Account Data (JSON)", icon: FileText, href: "/api/v1/account/export", external: true },
      ],
    },
  ], []);

  const filteredGroups = actions
    .map((g) => ({
      ...g,
      items: g.items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0);

  const filteredItems = filteredGroups.flatMap((g) => g.items);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [query, isOpen]);

  React.useEffect(() => {
    if (isOpen && itemRefs.current[selectedIndex]) {
      if (selectedIndex === 0 && containerRef.current) {
        containerRef.current.scrollTop = 0;
      } else {
        itemRefs.current[selectedIndex]?.scrollIntoView({
          block: "center",
        });
      }
    }
  }, [selectedIndex, isOpen]);

  const handleSelect = React.useCallback((item: any) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.href) {
      if (item.external) {
        window.open(item.href, "_blank");
      } else {
        router.push(item.href);
      }
    }
  }, [onClose, router]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery("");
          setSelectedIndex(0);
        }
        return;
      }
      
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredItems.length ? prev + 1 : prev));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filteredItems, selectedIndex, handleSelect]);

  // Lock body scroll when palette is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  let globalIndex = 0;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4 transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-surface/95 backdrop-blur-xl border border-border-light shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '80vh',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 20px 40px -10px rgba(0,0,0,0.2), 0 0 40px 10px rgba(var(--brand-rgb), 0.05)'
        }}
      >
        {/* Search Input Area */}
        <div className="flex items-center px-6 h-16 shrink-0 border-b border-border-light/50 bg-background/50 relative">
          <Search className="w-5 h-5 text-brand shrink-0 mr-4" />
          <input
            type="text"
            placeholder="Type a command or search workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent h-full text-base border-none text-text-primary placeholder:text-text-muted/60 font-medium tracking-wide focus:outline-none focus:ring-0 focus:border-transparent active:outline-none"
            style={{ outline: 'none', boxShadow: 'none' }}
          />
          <button
            onClick={onClose}
            className="absolute right-4 p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-text-primary transition-all duration-200"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div ref={containerRef} className="overflow-y-auto overscroll-contain p-3 relative" data-lenis-prevent="true" style={{ maxHeight: 'calc(80vh - 110px)' }}>
          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Search className="w-10 h-10 text-border-strong mb-4 opacity-50" />
              <p className="text-sm text-text-secondary font-medium">
                No matching commands found.
              </p>
              <p className="text-xs text-text-muted mt-1">
                Try searching for something else.
              </p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.group} className="mb-4 last:mb-0">
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-muted/70">
                  {group.group}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isSelected = globalIndex === selectedIndex;
                    globalIndex++;
                    
                    return (
                      <button
                        key={item.label}
                        ref={(el) => { itemRefs.current[globalIndex - 1] = el; }}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIndex - 1)}
                        className={`w-full flex items-center px-4 py-3 text-sm text-text-secondary rounded-xl transition-all duration-200 text-left group font-medium ${isSelected ? 'bg-brand/10 text-brand' : 'hover:bg-brand/5 hover:text-brand'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${isSelected ? 'bg-brand/15' : 'bg-surface-muted group-hover:bg-brand/10'}`}>
                          <Icon className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? 'text-brand' : 'text-text-muted group-hover:text-brand'}`} />
                        </div>
                        <span className={`flex-1 transition-transform duration-200 ${isSelected ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                          {item.label}
                        </span>
                        <span className={`text-xs font-mono transition-all duration-200 ${isSelected ? 'opacity-100 text-brand/70' : 'opacity-0 text-text-muted group-hover:opacity-100 group-hover:text-brand/70'}`}>
                          ↵
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-light/50 bg-background/50 text-[11px] text-text-muted flex items-center justify-between font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              Navigate with <kbd className="px-1.5 py-0.5 rounded border border-border-light bg-surface-muted text-[10px] font-mono shadow-sm">↑↓</kbd>
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded border border-border-light bg-surface-muted text-[10px] font-mono shadow-sm">
              ESC
            </kbd>{" "}
            to close
          </span>
        </div>
      </div>
    </div>
  );
}
