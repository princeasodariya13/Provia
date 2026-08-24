"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: unknown) => Promise<{ success: boolean; error?: string; details?: unknown }>;
  register: (data: unknown) => Promise<{ success: boolean; error?: string; details?: unknown }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  async function loadUser() {
    try {
      const res = await apiClient.get<User>("/api/v1/auth/me");
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (data: unknown) => {
    const res = await apiClient.post<User>("/api/v1/auth/login", data);
    if (res.success && res.data) {
      setUser(res.data);
      return { success: true };
    }
    return { success: false, error: res.error, details: res.details };
  };

  const register = async (data: unknown) => {
    const res = await apiClient.post<User>("/api/v1/auth/register", data);
    if (res.success && res.data) {
      setUser(res.data);
      return { success: true };
    }
    return { success: false, error: res.error, details: res.details };
  };

  const logout = async () => {
    setUser(null);
    apiClient.post("/api/v1/auth/logout", {}).catch(() => {});
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
