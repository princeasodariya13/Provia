"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Globe,
  BarChart3,
  GitBranch,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { CommandPalette } from "@/components/ui/command-palette";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  // Auth boundary
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6">
        <div className="w-8 h-8 bg-brand flex items-center justify-center rounded-lg shadow-sm mb-4">
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
          Loading Workspace
        </p>
      </div>
    );
  }

  if (!user) return null;

  const navigation: NavGroup[] = [
    {
      group: "Workspace",
      items: [
        { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { title: "Profile", href: "/profile", icon: User },
        { title: "Portfolio", href: "/portfolio", icon: Globe },
        { title: "Analytics", href: "/analytics", icon: BarChart3 },
      ],
    },
    {
      group: "Connections",
      items: [
        { title: "Integrations", href: "/integrations", icon: GitBranch },
      ],
    },
    {
      group: "Account",
      items: [
        { title: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Overview";
    if (pathname === "/profile") return "Profile";
    if (pathname === "/portfolio") return "Portfolio";
    if (pathname === "/analytics") return "Analytics";
    if (pathname === "/integrations") return "Integrations";
    if (pathname === "/settings") return "Settings";
    if (pathname.startsWith("/portfolio/")) return "Portfolio";
    return "Workspace";
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col md:flex-row text-text-primary selection:bg-brand/20 relative overflow-hidden">

      {/* Background Geometric Identity - Abstract Editorial Composition */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -right-[5%] w-[40vw] h-[40vw] rounded-full bg-slate-100 opacity-50" />
        <div className="absolute top-[30%] -left-[10%] w-[30vw] h-[60vh] bg-slate-100 opacity-50 transform -rotate-12" />
        <div className="absolute bottom-[-10%] right-[20%] w-[50vw] h-[30vh] bg-slate-100 opacity-50 transform rotate-6" />
      </div>

      {/* ── MOBILE TOP BAR ── */}
      <header className="md:hidden sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border-light flex items-center justify-between px-4 h-16 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-surface-muted"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand flex items-center justify-center rounded shadow-sm">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            <span className="font-bold text-[13px] tracking-tight text-text-primary">PROVIA</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCommandOpen(true)}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-surface-muted"
          >
            <Search className="w-5 h-5" />
          </button>
          <Avatar
            src={user.avatarUrl}
            fallback={user.fullName || user.email}
            size="sm"
            className="cursor-pointer border border-border-light shadow-sm"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          />
        </div>
      </header>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className={`hidden md:flex flex-col sticky top-0 h-screen shrink-0 bg-surface border-r border-border-light shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out z-30 ${collapsed ? "w-[72px]" : "w-[260px]"}`}>

        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 justify-between shrink-0">
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-3 pl-2 group">
              <div className="w-7 h-7 bg-brand flex items-center justify-center rounded-lg shadow-sm group-hover:shadow-md transition-shadow shrink-0">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <span className="font-extrabold text-[13px] tracking-widest text-text-primary group-hover:text-brand transition-colors">
                PROVIA
              </span>
            </Link>
          ) : (
            <Link href="/dashboard" className="mx-auto group">
              <div className="w-7 h-7 bg-brand flex items-center justify-center rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </Link>
          )}
        </div>

        {/* User Context Context */}
        {!collapsed && (
          <div className="px-5 mt-4 mb-2">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border-light bg-surface shadow-sm hover:border-brand-hover transition-colors cursor-pointer" onClick={() => router.push("/profile")}>
              <Avatar src={user.avatarUrl} fallback={user.fullName || user.email} size="sm" className="ring-2 ring-background border border-border-light shadow-sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate text-text-primary leading-tight">{user.fullName || "User"}</p>
                <p className="text-[11px] font-medium truncate text-text-secondary leading-tight mt-0.5">Professional Account</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-8 no-scrollbar">
          {navigation.map((group) => (
            <div key={group.group} className="space-y-1">
              {!collapsed && (
                <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  {group.group}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.title + item.href}
                    href={item.href}
                    title={collapsed ? item.title : undefined}
                    className={`flex items-center gap-3 px-3 py-2 text-[13px] font-bold transition-all rounded-xl ${active
                        ? "bg-brand/10 text-brand"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
                      } ${collapsed ? "justify-center px-0 py-2.5 mx-auto w-10 h-10" : ""}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-brand" : "text-text-muted group-hover:text-text-secondary"}`} />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border-light bg-surface/50 backdrop-blur-sm">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCollapsed(true)}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border-light text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" /> Collapse
              </button>
              <button
                onClick={() => logout()}
                className="p-2.5 rounded-xl border border-border-light text-error/70 hover:text-error hover:bg-error-muted transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-center">
              <button
                onClick={() => logout()}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-error/70 hover:text-error hover:bg-error-muted transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCollapsed(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-border-light text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
                title="Expand"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-text-primary/20 backdrop-blur-sm transition-opacity" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-surface shadow-2xl flex flex-col transform transition-transform border-r border-border-light">
            <div className="h-16 flex items-center justify-between px-5 border-b border-border-light bg-surface-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-brand flex items-center justify-center rounded-lg shadow-sm">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span className="font-extrabold text-[13px] tracking-widest text-text-primary">PROVIA</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-border-light transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 border-b border-border-light bg-surface">
              <div className="flex items-center gap-3">
                <Avatar src={user.avatarUrl} fallback={user.fullName || user.email} size="sm" className="shadow-sm" />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate text-text-primary">{user.fullName || "User"}</p>
                  <p className="text-xs text-text-secondary truncate">{user.email}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
              {navigation.map((group) => (
                <div key={group.group} className="space-y-1">
                  <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    {group.group}
                  </p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.title + item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 text-sm font-bold transition-all rounded-xl ${active
                            ? "bg-brand/10 text-brand"
                            : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
                          }`}
                      >
                        <Icon className={`w-5 h-5 ${active ? "text-brand" : "text-text-muted"}`} />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="p-5 border-t border-border-light bg-surface-muted/30">
              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-error/20 bg-error-muted/30 text-sm font-bold text-error hover:bg-error hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">

        {/* Desktop Header */}
        <header className="hidden md:flex sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border-light h-16 items-center justify-between px-8">
          <div className="flex items-center gap-2 text-[13px] font-medium">
            <span className="text-text-secondary">Workspace</span>
            <span className="text-border-strong text-xs">/</span>
            <span className="font-bold text-text-primary">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-5">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-3 pl-3 pr-1.5 py-1.5 text-xs text-text-secondary border border-border hover:border-border-strong hover:text-text-primary hover:bg-surface transition-all rounded-full bg-surface shadow-sm group w-56"
            >
              <Search className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary transition-colors" />
              <span className="flex-1 text-left font-medium">Search Provia...</span>
              <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest uppercase border border-border-light rounded-full bg-surface-muted text-text-secondary">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 sm:p-8 lg:p-12 w-full mx-auto">
          {children}
        </main>
      </div>

      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
