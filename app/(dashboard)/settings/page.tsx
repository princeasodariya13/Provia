"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, ShieldAlert, Download, Trash2, Key, CheckCircle2, AlertCircle } from "lucide-react";

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
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <PageHeader
        title="Account Settings"
        description="Manage your security credentials, active sessions, data privacy, and account lifecycle."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Settings", href: "/settings" },
        ]}
      />

      {/* Change Password */}
      <Card className="border-border-strong bg-background rounded-none">
        <CardHeader className="border-b border-border-light pb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-brand" />
            <CardTitle className="text-xl font-bold">Change Password</CardTitle>
          </div>
          <CardDescription className="text-xs text-text-secondary mt-1">
            Ensure your account is using a strong, unique password.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                Current Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>

            {pwStatus && (
              <div
                className={`p-3 text-xs font-bold border flex items-center gap-2 ${
                  pwStatus.type === "error"
                    ? "border-error bg-error/10 text-error"
                    : "border-success bg-success/10 text-success"
                }`}
              >
                {pwStatus.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{pwStatus.msg}</span>
              </div>
            )}

            <Button type="submit" disabled={pwLoading} variant="default">
              {pwLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Device Security */}
      <Card className="border-border-strong bg-background rounded-none">
        <CardHeader className="border-b border-border-light pb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand" />
            <CardTitle className="text-xl font-bold">Device & Session Security</CardTitle>
          </div>
          <CardDescription className="text-xs text-text-secondary mt-1">
            Immediately invalidate all active session tokens across all web browsers and devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm text-text-secondary">
            If you suspect unauthorized access or lost a device, log out of all sessions immediately.
          </p>

          <Button
            onClick={handleLogoutAll}
            disabled={logoutAllLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-warning" />
            {logoutAllLoading ? "Revoking Sessions..." : "Log Out of All Devices"}
          </Button>

          {logoutAllStatus && (
            <div
              className={`p-3 text-xs font-bold border flex items-center gap-2 max-w-md ${
                logoutAllStatus.type === "error"
                  ? "border-error bg-error/10 text-error"
                  : "border-success bg-success/10 text-success"
              }`}
            >
              {logoutAllStatus.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{logoutAllStatus.msg}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card className="border-border-strong bg-background rounded-none">
        <CardHeader className="border-b border-border-light pb-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-brand" />
            <CardTitle className="text-xl font-bold">Export Account Data</CardTitle>
          </div>
          <CardDescription className="text-xs text-text-secondary mt-1">
            Download a machine-readable JSON export of your profile, resume data, portfolios, and history.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm text-text-secondary">
            You own your professional data. Click below to download a full JSON file containing your complete account data model.
          </p>

          <Button asChild variant="outline" className="flex items-center gap-2 w-fit">
            <a href="/api/v1/account/export">
              <Download className="w-4 h-4" />
              Download JSON Export
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone - Account Deletion */}
      <Card className="border-error bg-background rounded-none">
        <CardHeader className="border-b border-error/40 bg-error/5 pb-4">
          <div className="flex items-center gap-2 text-error">
            <Trash2 className="w-5 h-5" />
            <CardTitle className="text-xl font-bold text-error">Danger Zone: Delete Account</CardTitle>
          </div>
          <CardDescription className="text-xs text-error/80 mt-1">
            Permanently erase your Provia profile, Cloudinary assets, resumes, and portfolios.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm text-text-secondary">
            Once deleted, your account cannot be recovered. All published portfolios will be taken offline immediately.
          </p>

          {!showDeleteSection ? (
            <Button
              onClick={() => setShowDeleteSection(true)}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account...
            </Button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-4 max-w-md border p-4 border-error/40 bg-error/5">
              <p className="text-xs font-bold text-text-primary">
                To confirm permanent deletion, type your account email address below:
              </p>
              <Input
                type="email"
                placeholder="Account email address"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                required
                className="border-error/40"
              />

              {deleteStatus && (
                <div
                  className={`p-3 text-xs font-bold border flex items-center gap-2 ${
                    deleteStatus.type === "error"
                      ? "border-error bg-error/10 text-error"
                      : "border-success bg-success/10 text-success"
                  }`}
                >
                  {deleteStatus.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{deleteStatus.msg}</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setShowDeleteSection(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={deleteLoading}
                  variant="destructive"
                  size="sm"
                >
                  {deleteLoading ? "Deleting..." : "Permanently Delete Account"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
