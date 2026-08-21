"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  FileText,
  Globe,
  BarChart3,
  GitBranch,
  Settings,
  HelpCircle,
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
  icon: React.ElementType;
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
      <div className="min-h-screen bg-surface-muted flex flex-col justify-center items-center p-6">
        <div className="w-6 h-6 bg-brand mb-4" />
        <p className="text-xs font-semibold tracking-widest text-text-secondary uppercase">
          Loading Provia...
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
        { title: "Resume Intelligence", href: "/profile", icon: FileText },
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
        { title: "Help", href: "/settings#help", icon: HelpCircle },
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
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-text-primary">

      {/* ── MOBILE TOP BAR ─────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 bg-background border-b border-border flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-brand flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            <span className="font-bold text-sm tracking-tight uppercase">Provia</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCommandOpen(true)}
            className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          <Avatar
            src={user.avatarUrl}
            fallback={user.fullName || user.email}
            size="sm"
            className="cursor-pointer"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          />
        </div>
      </header>

      {/* ── DESKTOP SIDEBAR ────────────────────────────────────────── */}
      <aside className={`hidden md:flex flex-col sticky top-0 h-screen shrink-0 bg-surface-muted border-r border-border transition-all duration-200 ${collapsed ? "w-14" : "w-60"}`}>

        {/* Brand + collapse */}
        <div className={`h-14 flex items-center border-b border-border px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-5 h-5 bg-brand flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <span className="font-bold text-sm tracking-tight uppercase text-text-primary group-hover:text-brand transition-colors">
                Provia
              </span>
            </Link>
          ) : (
            <Link href="/dashboard">
              <div className="w-5 h-5 bg-brand flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1 text-text-muted hover:text-text-primary transition-colors ${collapsed ? "hidden" : "flex"}`}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Workspace label */}
        {!collapsed && (
          <div className="px-4 pt-5 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              Personal
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-5">
          {navigation.map((group) => (
            <div key={group.group}>
              {!collapsed && (
                <p className="px-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  {group.group}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.title + item.href}
                      href={item.href}
                      title={collapsed ? item.title : undefined}
                      className={`flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium transition-colors rounded-none ${
                        active
                          ? "bg-brand text-white"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                      } ${collapsed ? "justify-center px-0 py-2" : ""}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-text-secondary"}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-border p-2 relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className={`w-full flex items-center gap-2.5 px-2 py-2 hover:bg-surface-hover transition-colors text-left ${collapsed ? "justify-center" : ""}`}
          >
            <Avatar src={user.avatarUrl} fallback={user.fullName || user.email} size="sm" />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate text-text-primary">{user.fullName || "Provia User"}</p>
                <p className="text-[10px] truncate text-text-muted">{user.email}</p>
              </div>
            )}
          </button>

          {/* User dropdown */}
          {userDropdownOpen && (
            <div className="absolute bottom-full left-1 right-1 mb-1 bg-background border border-border shadow-sm py-1 z-50">
              <div className="px-3 py-2 border-b border-border-light mb-1">
                <p className="text-xs font-semibold text-text-primary truncate">{user.fullName || "User"}</p>
                <p className="text-[10px] text-text-secondary truncate">{user.email}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-muted transition-colors"
              >
                <User className="w-3.5 h-3.5 text-text-secondary" />
                View Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-muted transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-text-secondary" />
                Settings
              </Link>
              <button
                onClick={() => { setUserDropdownOpen(false); logout(); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-error hover:bg-surface-muted transition-colors border-t border-border-light mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MOBILE DRAWER ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="relative bg-surface-muted w-72 h-full flex flex-col border-r border-border shadow-sm">
            {/* Drawer header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 bg-brand flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
                <span className="font-bold text-sm tracking-tight uppercase">Provia</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-text-secondary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
              {navigation.map((group) => (
                <div key={group.group}>
                  <p className="px-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    {group.group}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.title + item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2.5 px-2.5 py-2.5 text-sm font-medium transition-colors ${
                            active
                              ? "bg-brand text-white"
                              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-text-secondary"}`} />
                          <span>{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Drawer user */}
            <div className="border-t border-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar src={user.avatarUrl} fallback={user.fullName || user.email} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate text-text-primary">{user.fullName || "User"}</p>
                  <p className="text-[10px] truncate text-text-secondary">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center gap-2 py-2 border border-border text-xs font-semibold text-text-secondary hover:border-error hover:text-error transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">

        {/* Desktop topbar */}
        <header className="hidden md:flex sticky top-0 z-20 bg-background border-b border-border h-14 items-center justify-between px-8">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-muted font-medium">Workspace</span>
            <span className="text-border-strong text-xs">/</span>
            <span className="font-semibold text-text-primary">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Search trigger */}
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary border border-border hover:border-border-strong hover:text-text-primary transition-colors bg-surface-muted"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search...</span>
              <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono border border-border bg-background text-text-muted">
                ⌘K
              </kbd>
            </button>

            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 text-text-muted hover:text-text-primary border border-border hover:border-border-strong transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>

            {/* User chip */}
            <div className="flex items-center gap-2 pl-4 border-l border-border">
              <Avatar src={user.avatarUrl} fallback={user.fullName || user.email} size="sm" />
              <span className="text-xs font-semibold text-text-primary hidden lg:block">
                {user.fullName || "Account"}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 md:p-8 lg:p-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Command palette */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
