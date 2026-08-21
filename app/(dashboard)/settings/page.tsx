"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Download, Trash2, Key, CheckCircle2, AlertCircle, Laptop } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [pwStatus, setPwStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [logoutAllStatus, setLogoutAllStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPwStatus({ type: "error", msg: "New passwords do not match." });
      return;
    }
    setPwLoading(true);
    setPwStatus(null);
    try {
      const res = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwStatus({ type: "error", msg: data.error || "Failed to change password." });
      } else {
        setPwStatus({ type: "success", msg: "Password changed successfully. Redirecting to login..." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setPwStatus({ type: "error", msg: "An unexpected error occurred." });
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteLoading(true);
    setDeleteStatus(null);
    try {
      const res = await fetch("/api/v1/auth/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteStatus({ type: "error", msg: data.error || "Failed to delete account." });
      } else {
        setDeleteStatus({ type: "success", msg: "Account deleted. Redirecting..." });
        setTimeout(() => router.push("/"), 2000);
      }
    } catch {
      setDeleteStatus({ type: "error", msg: "An unexpected error occurred." });
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleLogoutAll() {
    setLogoutAllLoading(true);
    setLogoutAllStatus(null);
    try {
      const res = await fetch("/api/v1/auth/logout-all", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setLogoutAllStatus({ type: "error", msg: data.error || "Failed to log out of devices." });
      } else {
        setLogoutAllStatus({ type: "success", msg: "Successfully logged out of all devices. Redirecting..." });
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setLogoutAllStatus({ type: "error", msg: "An unexpected error occurred." });
    } finally {
      setLogoutAllLoading(false);
    }
  }

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-16">
      <PageHeader
        title="Account Settings"
        description="Manage your security preferences, active sessions, and personal data."
        breadcrumbs={[{ label: "Account", href: "/settings" }, { label: "Settings", href: "/settings" }]}
      />

      <div className="space-y-8">
        
        {/* Security & Authentication */}
        <section className="bg-surface border border-border-light rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border-light bg-surface-muted/30">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Key className="w-5 h-5 text-text-secondary" /> Change Password
            </h2>
            <p className="text-sm text-text-secondary mt-1">Ensure your account is using a long, random password to stay secure.</p>
          </div>
          
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>

              {pwStatus && (
                <div className={`p-4 flex items-start gap-3 rounded-xl border text-sm font-semibold ${
                  pwStatus.type === "success" 
                    ? "bg-success-muted border-success/30 text-success" 
                    : "bg-error-muted border-error/30 text-error"
                }`}>
                  {pwStatus.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <span>{pwStatus.msg}</span>
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" disabled={pwLoading} className="rounded-full px-6 font-bold">
                  {pwLoading ? "Updating Password..." : "Update Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </section>

        {/* Sessions */}
        <section className="bg-surface border border-border-light rounded-2xl overflow-hidden shadow-sm">
           <div className="p-6 border-b border-border-light bg-surface-muted/30">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Laptop className="w-5 h-5 text-text-secondary" /> Active Sessions
            </h2>
            <p className="text-sm text-text-secondary mt-1">Manage your active sessions across devices.</p>
          </div>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h4 className="font-bold text-text-primary mb-1">Revoke all sessions</h4>
                <p className="text-sm text-text-secondary">
                  This will log you out of all devices, including this one. You will need to log back in.
                </p>
              </div>
              <Button variant="outline" onClick={handleLogoutAll} disabled={logoutAllLoading} className="shrink-0 rounded-full font-bold">
                {logoutAllLoading ? "Revoking..." : "Log out all devices"}
              </Button>
            </div>
            
            {logoutAllStatus && (
              <div className={`mt-6 p-4 flex items-start gap-3 rounded-xl border text-sm font-semibold ${
                logoutAllStatus.type === "success" 
                  ? "bg-success-muted border-success/30 text-success" 
                  : "bg-error-muted border-error/30 text-error"
              }`}>
                {logoutAllStatus.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <span>{logoutAllStatus.msg}</span>
              </div>
            )}
          </CardContent>
        </section>

        {/* Data & Privacy */}
        <section className="bg-surface border border-border-light rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border-light bg-surface-muted/30">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Download className="w-5 h-5 text-text-secondary" /> Data & Privacy
            </h2>
            <p className="text-sm text-text-secondary mt-1">Export your canonical profile data and assets.</p>
          </div>
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-text-primary mb-1">Export Account Data</h4>
              <p className="text-sm text-text-secondary max-w-md">
                Download a complete JSON export of your canonical profile, connected integrations, and published portfolios.
              </p>
            </div>
            <Button variant="outline" asChild className="shrink-0 rounded-full font-bold shadow-sm">
              <a href="/api/v1/account/export" download="provia_export.json">
                Download JSON
              </a>
            </Button>
          </CardContent>
        </section>

        {/* Danger Zone */}
        <section className="bg-surface border border-error/30 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-error/30 bg-error-muted/30">
            <h2 className="text-lg font-bold text-error flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Danger Zone
            </h2>
            <p className="text-sm text-error/80 mt-1">Irreversible destructive actions.</p>
          </div>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
              <div>
                <h4 className="font-bold text-text-primary mb-1">Delete Account</h4>
                <p className="text-sm text-text-secondary max-w-md">
                  Permanently delete your account, canonical profile, uploaded resumes, and all published portfolios. This action cannot be undone.
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteSection(!showDeleteSection)}
                className="shrink-0 rounded-full font-bold bg-error hover:bg-[#A31D27] text-white shadow-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Account
              </Button>
            </div>

            {showDeleteSection && (
              <div className="mt-8 p-6 bg-error-muted/30 border border-error/30 rounded-xl max-w-xl">
                <h4 className="font-bold text-error mb-2">Are you absolutely sure?</h4>
                <p className="text-sm text-text-secondary mb-6">
                  Please type your email address below to confirm account deletion. This will instantly destroy all your data.
                </p>
                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Enter your email to confirm"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    required
                    className="border-error/30 focus-visible:ring-error"
                  />
                  
                  {deleteStatus && (
                    <div className={`p-4 flex items-start gap-3 rounded-lg text-sm font-semibold ${
                      deleteStatus.type === "success" 
                        ? "bg-success-muted text-success" 
                        : "bg-error-muted text-error"
                    }`}>
                      {deleteStatus.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                      <span>{deleteStatus.msg}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setShowDeleteSection(false)} className="rounded-full">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={deleteLoading} className="rounded-full bg-error hover:bg-[#A31D27] text-white font-bold">
                      {deleteLoading ? "Deleting..." : "Confirm Deletion"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </CardContent>
        </section>

      </div>
    </div>
  );
}
