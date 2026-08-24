"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const initialError = typeof window !== "undefined" 
    ? new URLSearchParams(window.location.search).get("error") || "" 
    : "";
  const [error, setError] = useState(initialError);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    if (initialError) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [initialError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsUnverified(false);
    setResendStatus("idle");
    setResendMsg("");
    setIsLoading(true);

    const res = await login({ email, password });
    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "An error occurred");
      const details = res.details as { code?: string } | undefined;
      if (details?.code === "UNVERIFIED_EMAIL") {
        setIsUnverified(true);
      }
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendStatus("loading");
    setResendMsg("");
    try {
      const res = await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus("success");
        setResendMsg(data.message || "Verification link sent!");
      } else {
        setResendStatus("error");
        setResendMsg(data.error || "Failed to send verification link.");
      }
    } catch {
      setResendStatus("error");
      setResendMsg("An unexpected error occurred.");
    }
  };

  return (
    <div className="w-full max-w-md my-12 relative z-10">
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-accent opacity-20 rounded-full mix-blend-multiply pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-brand opacity-10 transform rotate-12 mix-blend-multiply pointer-events-none" />
      
      <Card className="border-border-strong relative bg-surface z-10">
        <CardHeader className="space-y-4">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome back.</CardTitle>
          <CardDescription>
            Enter your credentials to access your professional portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-error/10 border border-error text-error text-sm font-medium flex flex-col gap-2">
                <p>{error}</p>
                {isUnverified && (
                  <div className="mt-1">
                    {resendStatus === "idle" && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        className="underline font-semibold hover:text-error/80 transition-colors"
                      >
                        Resend verification email
                      </button>
                    )}
                    {resendStatus === "loading" && <span className="opacity-70">Sending...</span>}
                    {resendStatus === "success" && <span className="text-emerald-600 font-semibold">{resendMsg}</span>}
                    {resendStatus === "error" && <span>{resendMsg}</span>}
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-primary">Email</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-primary">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border-strong" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-2 text-text-secondary">Or continue with</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-300 shadow-sm p-0"
              size="lg"
            >
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/api/v1/auth/google" className="w-full h-full flex items-center justify-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </a>
            </Button>
          </form>
          <div className="mt-8 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-text-primary hover:text-brand transition-colors">
              Create Account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
