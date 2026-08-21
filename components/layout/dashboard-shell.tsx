/* eslint-disable @typescript-eslint/no-explicit-any */
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
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { CommandPalette } from "@/components/ui/command-palette";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
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



  // Auth boundary check
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="provia-dark min-h-screen bg-background flex flex-col justify-center items-center p-6">
        <div className="w-12 h-12 bg-brand animate-pulse mb-4" />
        <p className="text-sm font-semibold tracking-wider text-text-secondary uppercase">
          Loading Provia Workspace...
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
        { title: "Portfolio Engine", href: "/portfolio", icon: Globe },
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
        { title: "Help & Support", href: "/settings#help", icon: HelpCircle },
      ],
    },
  ];

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Overview";
    if (pathname === "/profile") return "Profile Workspace";
    if (pathname === "/portfolio") return "Portfolio Engine";
    if (pathname === "/analytics") return "Analytics";
    if (pathname === "/integrations") return "Integrations";
    if (pathname === "/settings") return "Account Settings";
    if (pathname.startsWith("/portfolio/")) return "Portfolio Details";
    return "Workspace";
  };

  return (
    <div className="provia-dark min-h-screen bg-background flex flex-col md:flex-row text-text-primary antialiased">
      {/* Mobile Header Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-border-strong sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1 text-text-primary hover:bg-surface-muted border border-border-strong"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <span className="w-7 h-7 bg-brand text-white flex items-center justify-center text-sm font-black">
              P
            </span>
            <span>PROVIA</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCommandOpen(true)}
            className="p-1.5 border border-border-strong text-text-secondary hover:text-text-primary"
            title="Search (Cmd+K)"
          >
            <Search className="w-4 h-4" />
          </button>
          <Avatar
            src={user.avatarUrl}
            fallback={user.fullName || user.email}
            size="sm"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="cursor-pointer"
          />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-surface border-r border-border-strong sticky top-0 h-screen transition-all duration-200 z-30 shrink-0 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-border-strong flex items-center justify-between h-16">
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-brand text-white font-black flex items-center justify-center text-lg tracking-tighter">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight leading-none group-hover:text-brand transition-colors">
                  PROVIA
                </span>
                <span className="text-[10px] font-bold tracking-widest text-text-secondary uppercase mt-0.5">
                  Platform
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/dashboard" className="mx-auto">
              <div className="w-8 h-8 bg-brand text-white font-black flex items-center justify-center text-lg">
                P
              </div>
            </Link>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1 border border-border-strong hover:bg-surface-muted text-text-secondary hover:text-text-primary transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Workspace Indicator */}
        {!collapsed && (
          <div className="px-4 py-3 bg-surface-muted/40 border-b border-border-light flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-text-secondary text-[10px]">
              Workspace
            </span>
            <span className="font-semibold text-text-primary flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-success inline-block" />
              Personal
            </span>
          </div>
        )}

        {/* Nav Groups */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {navigation.map((group) => (
            <div key={group.group}>
              {!collapsed && (
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                  {group.group}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      title={collapsed ? item.title : undefined}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-brand text-white border-l-2 border-brand"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-muted/70"
                      } ${collapsed ? "justify-center px-0" : ""}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-text-secondary"}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-border-strong relative bg-surface">
          <div
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-3 p-2 hover:bg-surface-muted cursor-pointer transition-colors border border-border-light"
          >
            <Avatar
              src={user.avatarUrl}
              fallback={user.fullName || user.email}
              size="sm"
            />
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold truncate text-text-primary">
                  {user.fullName || "Provia User"}
                </span>
                <span className="text-[10px] text-text-secondary truncate font-mono">
                  {user.email}
                </span>
              </div>
            )}
          </div>

          {/* User Dropdown Menu */}
          {userDropdownOpen && (
            <div className="absolute bottom-full left-2 right-2 mb-2 bg-background border border-border-strong shadow-xl p-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3 py-2 border-b border-border-light text-xs">
                <p className="font-bold text-text-primary truncate">{user.fullName || "User"}</p>
                <p className="text-[10px] text-text-secondary truncate">{user.email}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-primary hover:bg-brand hover:text-white transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                View Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-primary hover:bg-brand hover:text-white transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </Link>
              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-error hover:bg-error hover:text-white transition-colors text-left border-t border-border-light mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex md:hidden">
          <div className="bg-surface w-4/5 max-w-xs h-full flex flex-col border-r border-border-strong animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-border-strong flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-brand text-white font-black flex items-center justify-center text-lg">
                  P
                </div>
                <span className="font-bold text-lg tracking-tight">PROVIA</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 border border-border-strong text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {navigation.map((group) => (
                <div key={group.group}>
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                    {group.group}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors ${
                            isActive
                              ? "bg-brand text-white"
                              : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border-strong space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <Avatar src={user.avatarUrl} fallback={user.fullName || user.email} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate">{user.fullName || "User"}</p>
                  <p className="text-[10px] text-text-secondary truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center gap-2 py-2 border border-error text-error text-xs font-bold hover:bg-error hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Product Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-surface border-b border-border-strong h-16 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">
              Workspace /
            </span>
            <h1 className="text-base font-bold text-text-primary">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 border border-border-strong bg-background text-text-secondary hover:text-text-primary text-xs transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-brand" />
              <span>Search workspace...</span>
              <kbd className="px-1.5 py-0.5 border border-border-strong bg-surface text-[10px] font-mono text-text-secondary">
                ⌘K
              </kbd>
            </button>

            <div className="flex items-center gap-2 border-l border-border-strong pl-4">
              <Avatar
                src={user.avatarUrl}
                fallback={user.fullName || user.email}
                size="sm"
              />
              <span className="text-xs font-bold text-text-primary">
                {user.fullName || "Account"}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Command Palette */}
        <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      </div>
    </div>
  );
}
