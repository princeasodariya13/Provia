/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { CardSkeleton } from "@/components/ui/skeleton";
import { GitBranch, RefreshCw, CheckCircle2, AlertCircle, Briefcase, Plus, Link as LinkIcon, Unlink } from "lucide-react";

interface Connection {
  provider: "GITHUB" | "LINKEDIN";
  state: "NOT_CONNECTED" | "CONNECTED" | "IMPORTING" | "SYNCED" | "FAILED";
  lastSyncAt: string | null;
  errorMessage: string | null;
}

export default function IntegrationsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [integrationsRes, profileRes] = await Promise.all([
          apiClient.get<Connection[]>("/api/v1/integrations"),
          apiClient.get<any>("/api/v1/profile")
        ]);
        
        if (integrationsRes.success && integrationsRes.data) {
          setConnections(integrationsRes.data);
        }
        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
        }
      } catch (err) {
        console.error("Failed to load integrations or profile:", err);
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
      <div className="space-y-12 max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="h-10 w-1/3 bg-surface-muted animate-pulse" />
          <div className="h-5 w-1/2 bg-surface-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const githubState = getProviderState("GITHUB");
  const linkedinState = getProviderState("LINKEDIN");

  const githubProjects = profile?.projects?.filter((p: any) => p.source === "GITHUB") || [];
  const githubSkills = profile?.skills?.filter((s: any) => s.source === "GITHUB") || [];
  
  const linkedinExperiences = profile?.experiences?.filter((e: any) => e.source === "LINKEDIN") || [];
  const linkedinSkills = profile?.skills?.filter((s: any) => s.source === "LINKEDIN") || [];

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16">
      <PageHeader
        title="External Integrations"
        description="Connect your verified accounts to automatically import public repositories, work history, and identity signals."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Integrations", href: "/integrations" },
        ]}
      />

      {error && (
        <div className="p-5 border border-error bg-error-muted text-error text-sm font-semibold flex items-center gap-3 rounded-xl shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* GitHub Integration */}
        <IntegrationCard
          name="GitHub"
          icon={<GitBranch className="w-6 h-6" />}
          description="Import your top public repositories, languages, and contribution statistics directly into your portfolio projects."
          state={githubState}
          onConnect={() => handleConnect("GITHUB")}
          connectedIcon={<GitBranch className="w-4 h-4 mr-2" />}
          connectedLabel="Synced Repositories"
          syncedData={
            githubState.state === "SYNCED" || githubState.state === "CONNECTED" ? (
              <div className="mt-4 space-y-4">
                {githubProjects.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {githubProjects.map((p: any) => (
                      <div key={p.id} className="p-3 bg-surface border border-border-light rounded-lg text-sm">
                        <div className="font-bold text-text-primary truncate">{p.name}</div>
                        {p.description && <div className="text-text-secondary text-xs truncate mt-1">{p.description}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-text-muted italic">No repositories imported yet.</div>
                )}
                {githubSkills.length > 0 && (
                  <div className="pt-2 border-t border-border-light">
                    <div className="text-xs font-bold text-text-secondary mb-2">IMPORTED LANGUAGES</div>
                    <div className="flex flex-wrap gap-2">
                      {githubSkills.map((s: any) => (
                        <Badge key={s.id} variant="secondary" className="text-[10px]">{s.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null
          }
        />

        {/* LinkedIn Integration */}
        <IntegrationCard
          name="LinkedIn"
          icon={<Briefcase className="w-6 h-6 text-[#0A66C2]" />}
          description="Sync your professional timeline, validated experience, and skills directly into your profile data."
          state={linkedinState}
          onConnect={() => handleConnect("LINKEDIN")}
          connectedIcon={<Briefcase className="w-4 h-4 mr-2" />}
          connectedLabel="Synced Experience"
          syncedData={
            linkedinState.state === "SYNCED" || linkedinState.state === "CONNECTED" ? (
              <div className="mt-4 space-y-4">
                {linkedinExperiences.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {linkedinExperiences.map((e: any) => (
                      <div key={e.id} className="p-3 bg-surface border border-border-light rounded-lg text-sm">
                        <div className="font-bold text-text-primary truncate">{e.title}</div>
                        <div className="text-text-secondary text-xs truncate mt-1">{e.company}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-text-muted italic">No experiences imported yet.</div>
                )}
                {linkedinSkills.length > 0 && (
                  <div className="pt-2 border-t border-border-light">
                    <div className="text-xs font-bold text-text-secondary mb-2">IMPORTED SKILLS</div>
                    <div className="flex flex-wrap gap-2">
                      {linkedinSkills.map((s: any) => (
                        <Badge key={s.id} variant="secondary" className="text-[10px]">{s.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null
          }
        />

      </div>
    </div>
  );
}

function IntegrationCard({ 
  name, 
  icon, 
  description, 
  state, 
  onConnect,
  connectedIcon,
  connectedLabel,
  syncedData
}: { 
  name: string, 
  icon: React.ReactNode, 
  description: string, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any,
  onConnect: () => void,
  connectedIcon: React.ReactNode,
  connectedLabel: string,
  syncedData?: React.ReactNode
}) {
  
  const isConnected = state.state === "CONNECTED" || state.state === "SYNCED";
  const isProcessing = state.state === "IMPORTING";
  const hasError = state.state === "FAILED";

  return (
    <div className="bg-surface border border-border-light rounded-2xl overflow-hidden shadow-sm flex flex-col h-full card-hover-depth">
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl flex items-center justify-center ${isConnected ? 'bg-success-muted' : 'bg-surface-muted border border-border-light'}`}>
              {icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">{name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : isProcessing ? 'bg-brand animate-pulse' : hasError ? 'bg-error' : 'bg-border-strong'}`} />
                <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                  {state.state.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-text-secondary mb-8 flex-1 leading-relaxed">
          {description}
        </p>

        {isConnected ? (
          <div className="space-y-6">
            <div className="p-4 bg-surface-muted/50 border border-border-light rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-secondary flex items-center">
                  {connectedIcon} {connectedLabel}
                </span>
                <Badge variant="success">Active</Badge>
              </div>
              {state.lastSyncAt && (
                <div className="text-xs text-text-muted">
                  Last synced: {new Date(state.lastSyncAt).toLocaleString()}
                </div>
              )}
              
              {syncedData}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="w-full rounded-full bg-white shadow-sm font-bold" onClick={onConnect}>
                <RefreshCw className="w-4 h-4 mr-2" /> Force Sync
              </Button>
              <Button variant="outline" className="w-full rounded-full text-error hover:bg-error-muted hover:border-error transition-colors font-bold hover:text-error">
                <Unlink className="w-4 h-4 mr-2" /> Disconnect
              </Button>
            </div>
          </div>
        ) : isProcessing ? (
          <div className="p-4 bg-brand-muted/30 border border-brand/20 rounded-xl flex items-center justify-center gap-3 h-[104px]">
            <RefreshCw className="w-5 h-5 text-brand animate-spin" />
            <span className="text-sm font-bold text-brand">Importing Data...</span>
          </div>
        ) : (
          <div className="mt-auto">
            {hasError && (
              <div className="mb-4 p-3 bg-error-muted border border-error text-error text-xs font-semibold rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{state.errorMessage || "Connection failed. Please try again."}</span>
              </div>
            )}
            <Button variant="default" className="w-full rounded-full shadow-sm font-bold py-6 text-sm" onClick={onConnect}>
              <LinkIcon className="w-4 h-4 mr-2" /> Connect {name}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
