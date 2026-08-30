"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Download, Trash2, Key, CheckCircle2, AlertCircle, Laptop, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api-client";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function SettingsPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isConfirmingPasswordUpdate, setIsConfirmingPasswordUpdate] = useState(false);
  const [isConfirmingLogoutAll, setIsConfirmingLogoutAll] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const toast = useToast();

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setIsConfirmingPasswordUpdate(true);
  }

  async function confirmPasswordUpdate() {
    setIsConfirmingPasswordUpdate(false);
    setPwLoading(true);
    try {
      const res = await apiClient.post<any>("/api/v1/auth/change-password", { currentPassword, newPassword });
      if (!res.success) {
        const detailMsg = Array.isArray(res.details) && res.details.length > 0 ? res.details[0].message : null;
        toast.error(detailMsg || res.error || "Failed to change password.");
      } else {
        toast.success("Password changed successfully. Redirecting to login...");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setPwLoading(false);
    }
  }

  async function confirmDeleteAccount() {
    setIsConfirmingDelete(false);
    setDeleteLoading(true);
    try {
      const res = await apiClient.delete<any>("/api/v1/auth/account", { body: JSON.stringify({ confirmEmail }) });
      if (!res.success) {
        toast.error(res.error || "Failed to delete account.");
      } else {
        toast.success("Account deleted. Redirecting...");
        setTimeout(() => router.push("/"), 2000);
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function confirmLogoutAll() {
    setIsConfirmingLogoutAll(false);
    setLogoutAllLoading(true);
    try {
      const res = await apiClient.post<any>("/api/v1/auth/logout-all", {});
      if (!res.success) {
        toast.error(res.error || "Failed to log out of devices.");
      } else {
        toast.success("Successfully logged out of all devices. Redirecting...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setLogoutAllLoading(false);
    }
  }

  async function handleExportData() {
    setExportLoading(true);
    toast.success("Preparing your account data for download...");
    try {
      const response = await fetch("/api/v1/account/export");
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to export data");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Get filename from Content-Disposition header if possible, else fallback
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `provia_export_${new Date().toISOString().split("T")[0]}.json`;
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = contentDisposition.split("filename=")[1].replace(/"/g, "");
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Account data exported successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to export data");
    } finally {
      setExportLoading(false);
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
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Confirm New Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

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
              <Button variant="outline" onClick={() => setIsConfirmingLogoutAll(true)} disabled={logoutAllLoading} className="shrink-0 rounded-full font-bold">
                {logoutAllLoading ? "Revoking..." : "Log out all devices"}
              </Button>
            </div>
            
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
            <Button 
              variant="outline" 
              onClick={handleExportData} 
              disabled={exportLoading} 
              className="shrink-0 rounded-full font-bold shadow-sm"
            >
              {exportLoading ? "Preparing Download..." : "Download JSON"}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h4 className="font-bold text-text-primary mb-1">Delete Account</h4>
                <p className="text-sm text-text-secondary max-w-md">
                  Permanently delete your account, canonical profile, uploaded resumes, and all published portfolios. This action cannot be undone.
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setIsConfirmingDelete(true)}
                disabled={deleteLoading}
                className="shrink-0 rounded-full font-bold bg-error hover:bg-[#A31D27] text-white shadow-sm"
              >
                {deleteLoading ? (
                  "Deleting..."
                ) : (
                  <><Trash2 className="w-4 h-4 mr-2" /> Delete Account</>
                )}
              </Button>
            </div>
          </CardContent>
        </section>

      </div>

      <ConfirmModal
        isOpen={isConfirmingPasswordUpdate}
        onClose={() => setIsConfirmingPasswordUpdate(false)}
        onConfirm={confirmPasswordUpdate}
        title="Update Password"
        description="Are you sure you want to change your password? You will be logged out of all active sessions and required to log in again."
        confirmText="Update Password"
      />

      <ConfirmModal
        isOpen={isConfirmingLogoutAll}
        onClose={() => setIsConfirmingLogoutAll(false)}
        onConfirm={confirmLogoutAll}
        title="Revoke All Sessions"
        description="Are you sure you want to log out of all active devices? You will be immediately logged out of this device and required to log in again."
        confirmText="Log Out All Devices"
      />

      <ConfirmModal
        isOpen={isConfirmingDelete}
        onClose={() => {
          setIsConfirmingDelete(false);
          setConfirmEmail("");
        }}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        description="Please type your email address below to confirm account deletion. This action is irreversible and will instantly destroy all your data."
        confirmText="Permanently Delete"
        isConfirmDisabled={!confirmEmail}
      >
        <Input
          type="email"
          placeholder="Enter your email to confirm"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          className="border-error/30 focus-visible:ring-error mt-2 w-full"
        />
      </ConfirmModal>
    </div>
  );
}
