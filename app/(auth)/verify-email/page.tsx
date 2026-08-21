"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "" : "No verification token found. Please check your email link.");

  useEffect(() => {
    if (!token) return; // Already set to error state above

    fetch("/api/v1/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully.");
          setTimeout(() => router.push("/login"), 2500);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed. The link may have expired.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token, router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
      <div style={{ background: "#fff", padding: "2.5rem", borderRadius: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.08)", maxWidth: 420, textAlign: "center" }}>
        <h1 style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: "1rem" }}>Email Verification</h1>
        {status === "loading" && <p style={{ color: "#6b7280" }}>Verifying your email address…</p>}
        {status === "success" && (
          <>
            <p style={{ color: "#16a34a", fontWeight: 500 }}>✓ {message}</p>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.5rem" }}>Redirecting to login…</p>
          </>
        )}
        {status === "error" && (
          <>
            <p style={{ color: "#dc2626", fontWeight: 500 }}>{message}</p>
            <button
              onClick={() => router.push("/login")}
              style={{ marginTop: "1.5rem", padding: "0.625rem 1.5rem", background: "#000", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500 }}
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading…</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
