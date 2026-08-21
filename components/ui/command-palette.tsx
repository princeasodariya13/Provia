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
  const { logout } = useAuth();
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
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
        { label: "Log Out", icon: LogOut, action: () => logout() },
      ],
    },
  ];

  const filteredGroups = actions
    .map((g) => ({
      ...g,
      items: g.items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0);

  const handleSelect = (item: any) => {
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
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="bg-background border border-border-strong w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 border-b border-border-strong bg-surface">
          <Search className="w-5 h-5 text-text-secondary shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Type a command or search workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent py-4 text-sm outline-none text-text-primary placeholder:text-text-secondary"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-muted text-text-secondary rounded-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredGroups.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-secondary">
              No matching commands found.
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.group} className="mb-3">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                  {group.group}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center px-3 py-2.5 text-sm text-text-primary hover:bg-brand hover:text-white transition-colors text-left group"
                      >
                        <Icon className="w-4 h-4 mr-3 text-brand group-hover:text-white shrink-0" />
                        <span className="font-medium flex-1">{item.label}</span>
                        <span className="text-xs text-text-secondary group-hover:text-white/80 font-mono">
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

        <div className="px-4 py-2 border-t border-border-light bg-surface text-[11px] text-text-secondary flex justify-between">
          <span>Navigate with search</span>
          <span>
            <kbd className="px-1.5 py-0.5 border border-border-strong bg-background text-[10px]">
              ESC
            </kbd>{" "}
            to close
          </span>
        </div>
      </div>
    </div>
  );
}
