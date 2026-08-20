"use client";

import { useState } from "react";
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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await login({ email, password });
    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "An error occurred");
      setIsLoading(false);
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
              <div className="p-3 bg-error/10 border border-error text-error text-sm font-medium">
                {error}
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
