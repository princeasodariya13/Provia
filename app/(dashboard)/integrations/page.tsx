"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Connection {
  provider: "GITHUB" | "LINKEDIN";
  state: "NOT_CONNECTED" | "CONNECTED" | "IMPORTING" | "SYNCED" | "FAILED";
  lastSyncAt: string | null;
  errorMessage: string | null;
}

export default function IntegrationsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const res = await apiClient.get<Connection[]>("/api/v1/integrations");
      if (res.success && res.data) {
        setConnections(res.data);
      }
      setIsLoading(false);
    }
    if (!isAuthLoading) {
      load();
    }
  }, [user, isAuthLoading]);

  const handleConnect = async (provider: string) => {
    setError(null);
    const state = window.crypto.randomUUID();
    sessionStorage.setItem("oauth_state", state);
    
    const res = await apiClient.get<{ authUrl: string }>(`/api/v1/integrations/${provider}/connect?state=${encodeURIComponent(state)}`);
    if (res.success && res.data) {
      window.location.href = res.data.authUrl;
    } else {
      setError(res.error || `Failed to initiate ${provider} connection. Provider might not be configured.`);
    }
  };

  const getProviderState = (provider: string) => {
    return connections.find(c => c.provider === provider) || { state: "NOT_CONNECTED", errorMessage: null };
  };

  if (isAuthLoading || isLoading) return <div className="animate-pulse">Loading integrations...</div>;
  if (!user) return <div>Please log in.</div>;

  return (
    <div className="space-y-8 relative z-10">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-10 rounded-full mix-blend-multiply pointer-events-none -z-10" />
      
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Professional Identity</h1>
        <p className="text-text-secondary text-lg">Connect your external profiles to seed your canonical portfolio.</p>
      </div>

      {error && (
        <div className="p-4 border border-error bg-error/10 text-error font-medium">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <ProviderCard 
          name="GitHub" 
          state={getProviderState("GITHUB")} 
          onConnect={() => handleConnect("GITHUB")} 
        />
        <ProviderCard 
          name="LinkedIn" 
          state={getProviderState("LINKEDIN")} 
          onConnect={() => handleConnect("LINKEDIN")} 
        />
      </div>
    </div>
  );
}

function ProviderCard({ name, state, onConnect }: { name: string, state: { state: string, errorMessage: string | null }, onConnect: () => void }) {
  return (
    <Card className="border-border-strong relative overflow-hidden">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {state.state === "NOT_CONNECTED" ? `Connect your ${name} profile.` : `Status: ${state.state}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.errorMessage && (
          <p className="text-error text-sm mb-4">Error: {state.errorMessage}</p>
        )}
        {state.state === "NOT_CONNECTED" || state.state === "FAILED" ? (
          <Button onClick={onConnect} variant="default" className="w-full sm:w-auto">
            Connect {name}
          </Button>
        ) : (
          <Button disabled variant="outline" className="w-full sm:w-auto">
            {state.state === "SYNCED" ? "Connected" : "Processing..."}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
