"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        setPwStatus({ type: "success", msg: "Password changed. You will be redirected to login." });
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
        setDeleteStatus({ type: "success", msg: "Account deleted. Redirecting…" });
        setTimeout(() => router.push("/"), 2000);
      }
    } catch {
      setDeleteStatus({ type: "error", msg: "An unexpected error occurred." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontWeight: 700, fontSize: "1.75rem", marginBottom: "2rem" }}>Account Settings</h1>

      {/* Change Password */}
      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "1rem" }}>Change Password</h2>
        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="New password (min. 8 characters)"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            minLength={8}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmNewPassword}
            onChange={e => setConfirmNewPassword(e.target.value)}
            required
            style={inputStyle}
          />
          {pwStatus && (
            <p style={{ color: pwStatus.type === "error" ? "#dc2626" : "#16a34a", fontSize: "0.875rem" }}>
              {pwStatus.msg}
            </p>
          )}
          <button
            type="submit"
            disabled={pwLoading}
            style={{ ...buttonStyle, background: "#000", color: "#fff", opacity: pwLoading ? 0.6 : 1 }}
          >
            {pwLoading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </section>

      {/* Account Deletion */}
      <section style={{ background: "#fff", border: "1px solid #fca5a5", borderRadius: 10, padding: "1.5rem" }}>
        <h2 style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.5rem", color: "#dc2626" }}>
          Delete Account
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
          This action is permanent. All your data, connections, and published portfolio will be deleted immediately.
        </p>
        {!showDeleteSection ? (
          <button
            onClick={() => setShowDeleteSection(true)}
            style={{ ...buttonStyle, background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5" }}
          >
            Delete My Account
          </button>
        ) : (
          <form onSubmit={handleDeleteAccount} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <p style={{ fontSize: "0.875rem", color: "#374151" }}>
              To confirm, type your account email address below:
            </p>
            <input
              type="email"
              placeholder="Your account email"
              value={confirmEmail}
              onChange={e => setConfirmEmail(e.target.value)}
              required
              style={{ ...inputStyle, borderColor: "#fca5a5" }}
            />
            {deleteStatus && (
              <p style={{ color: deleteStatus.type === "error" ? "#dc2626" : "#16a34a", fontSize: "0.875rem" }}>
                {deleteStatus.msg}
              </p>
            )}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setShowDeleteSection(false)}
                style={{ ...buttonStyle, background: "#f3f4f6", color: "#374151" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={deleteLoading}
                style={{ ...buttonStyle, background: "#dc2626", color: "#fff", opacity: deleteLoading ? 0.6 : 1 }}
              >
                {deleteLoading ? "Deleting…" : "Permanently Delete"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.625rem 0.875rem",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: "0.9rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.625rem 1.25rem",
  border: "none",
  borderRadius: 6,
  fontWeight: 500,
  cursor: "pointer",
  fontSize: "0.9rem",
};
