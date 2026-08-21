/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { CardSkeleton } from "@/components/ui/skeleton";
import { GitBranch, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Globe, Share2 } from "lucide-react";

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
      try {
        const res = await apiClient.get<Connection[]>("/api/v1/integrations");
        if (res.success && res.data) {
          setConnections(res.data);
        }
      } catch (err) {
        console.error("Failed to load integrations:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (!isAuthLoading) {
      load();
    }
  }, [user, isAuthLoading]);

  const handleConnect = async (provider: string) => {
    setError(null);
    const state = window.crypto.randomUUID();
    sessionStorage.setItem("oauth_state", state);

    const res = await apiClient.get<{ authUrl: string }>(
      `/api/v1/integrations/${provider}/connect?state=${encodeURIComponent(state)}`
    );
    if (res.success && res.data) {
      window.location.href = res.data.authUrl;
    } else {
      setError(
        res.error || `Failed to initiate ${provider} connection. Provider might not be configured.`
      );
    }
  };

  const getProviderState = (provider: string) => {
    return (
      connections.find((c) => c.provider === provider) || {
        state: "NOT_CONNECTED",
        lastSyncAt: null,
        errorMessage: null,
      }
    );
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-surface animate-pulse" />
          <div className="h-4 w-96 bg-surface animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeader
        title="External Integrations"
        description="Connect your verified GitHub and LinkedIn profiles to import public repositories, work history, and identity signals."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Integrations", href: "/integrations" },
        ]}
      />

      {error && (
        <div className="p-4 border border-error bg-error/10 text-error text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProviderCard
          name="GitHub"
          icon={<GitBranch className="w-6 h-6 text-brand" />}
          description="Import public repositories, commit activity, primary languages, and contributions."
          state={getProviderState("GITHUB")}
          onConnect={() => handleConnect("GITHUB")}
        />

        <ProviderCard
          name="LinkedIn"
          icon={<Share2 className="w-6 h-6 text-brand" />}
          description="Sync verified positions, company details, professional headline, and education history."
          state={getProviderState("LINKEDIN")}
          onConnect={() => handleConnect("LINKEDIN")}
        />
      </div>
    </div>
  );
}

function ProviderCard({
  name,
  icon,
  description,
  state,
  onConnect,
}: {
  name: string;
  icon: React.ReactNode;
  description: string;
  state: { state: string; lastSyncAt: string | null; errorMessage: string | null };
  onConnect: () => void;
}) {
  const isConnected = state.state === "SYNCED" || state.state === "CONNECTED";
  const isProcessing = state.state === "IMPORTING";

  return (
    <Card className="border-border-strong bg-background rounded-none hover:border-brand/50 transition-colors">
      <CardHeader className="border-b border-border-light pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-border-strong bg-surface">{icon}</div>
            <div>
              <CardTitle className="text-xl font-bold">{name}</CardTitle>
              <CardDescription className="text-xs text-text-secondary mt-0.5">
                OAuth 2.0 Identity Provider
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={
              isConnected ? "success" : isProcessing ? "warning" : state.state === "FAILED" ? "error" : "secondary"
            }
          >
            {state.state}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>

        {state.errorMessage && (
          <div className="p-3 border border-error bg-error/10 text-error text-xs font-semibold">
            {state.errorMessage}
          </div>
        )}

        {state.lastSyncAt && (
          <p className="text-xs text-text-secondary font-mono">
            Last synced: {new Date(state.lastSyncAt).toLocaleString()}
          </p>
        )}

        <div>
          {!isConnected && !isProcessing ? (
            <Button onClick={onConnect} variant="default" className="w-full flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Connect {name}
            </Button>
          ) : isProcessing ? (
            <Button disabled variant="outline" className="w-full flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-brand" />
              Syncing Data...
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="p-3 border border-success bg-success/10 text-success text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {name} account connected successfully
              </div>
              <Button onClick={onConnect} variant="outline" size="sm" className="w-full">
                Re-sync Account
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
