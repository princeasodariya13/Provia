"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await register({ name, email, password });
    if (res.success) {
      router.push("/dashboard"); // Future step
    } else {
      // Basic handling of Zod validation details array or string error
      if (res.details && Array.isArray(res.details) && res.details.length > 0) {
        setError(res.details[0].message);
      } else {
        setError(res.error || "An error occurred");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md my-12 relative z-10">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-beige opacity-20 rounded-full mix-blend-multiply pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-64 bg-taupe opacity-10 transform -rotate-12 mix-blend-multiply pointer-events-none" />
      
      <Card className="border-border-strong relative bg-surface z-10">
        <CardHeader className="space-y-4">
          <CardTitle className="text-3xl font-bold tracking-tight">Establish identity.</CardTitle>
          <CardDescription>
            Create an account to begin building your editorial portfolio.
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
              <label className="text-xs font-bold uppercase tracking-widest text-text-primary">Full Name</label>
              <Input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
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
                minLength={8}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-8 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-text-primary hover:text-brand transition-colors">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
