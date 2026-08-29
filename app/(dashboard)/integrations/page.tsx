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
  const [isImporting, setIsImporting] = useState(false);
  const [selectedGithubRepos, setSelectedGithubRepos] = useState<string[]>([]);
  const [selectedGithubSkills, setSelectedGithubSkills] = useState<string[]>([]);

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
        rawSnapshots: [],
      }
    );
  };

  const handleImportRepos = async (reposToImport: any[]) => {
    if (reposToImport.length === 0) return;
    setIsImporting(true);
    try {
      const res = await apiClient.post("/api/v1/integrations/github/import-repos", {
        repositories: reposToImport
      });
      if (res.success) {
        // Refresh profile
        const profileRes = await apiClient.get<any>("/api/v1/profile");
        if (profileRes.success && profileRes.data) setProfile(profileRes.data);
        setSelectedGithubRepos([]); // clear selection
      } else {
        setError(res.error || "Failed to import repositories");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to import repositories");
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportSkills = async (skillsToImport: string[]) => {
    if (skillsToImport.length === 0) return;
    setIsImporting(true);
    try {
      const res = await apiClient.post("/api/v1/integrations/github/import-skills", {
        skills: skillsToImport
      });
      if (res.success) {
        // Refresh profile
        const profileRes = await apiClient.get<any>("/api/v1/profile");
        if (profileRes.success && profileRes.data) setProfile(profileRes.data);
        setSelectedGithubSkills([]); // clear selection
      } else {
        setError(res.error || "Failed to import languages");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to import languages");
    } finally {
      setIsImporting(false);
    }
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

  // Parse raw github repositories
  let rawGithubRepos: any[] = [];
  let rawGithubSkills: string[] = [];
  if (githubState.rawSnapshots?.[0]?.data) {
    try {
      const rawData = JSON.parse(githubState.rawSnapshots[0].data);
      rawGithubRepos = rawData.repositories || [];
      rawGithubSkills = rawData.derived_skills || [];
    } catch (e) {
      // ignore
    }
  }

  // Pre-calculate which raw repos and skills are already imported
  const importedRepoUrls = new Set(githubProjects.map((p: any) => p.repositoryUrl || p.externalId));
  const importedSkillNames = new Set(githubSkills.map((s: any) => s.name));

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
                {rawGithubRepos.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-text-secondary flex justify-between items-center">
                      <span>SELECT REPOSITORIES TO IMPORT</span>
                      {selectedGithubRepos.length > 0 && (
                        <Button 
                          size="sm" 
                          onClick={() => {
                            const reposToImport = rawGithubRepos.filter(r => selectedGithubRepos.includes(r.html_url));
                            handleImportRepos(reposToImport);
                          }}
                          disabled={isImporting}
                          className="h-7 text-xs font-bold rounded-md px-3"
                        >
                          {isImporting ? "Importing..." : `Import ${selectedGithubRepos.length} Selected`}
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {rawGithubRepos.map((repo: any) => {
                        const isImported = importedRepoUrls.has(repo.html_url);
                        const isSelected = selectedGithubRepos.includes(repo.html_url);
                        
                        return (
                          <div 
                            key={repo.html_url} 
                            onClick={() => {
                              if (isImported) return;
                              setSelectedGithubRepos(prev => 
                                isSelected 
                                  ? prev.filter(url => url !== repo.html_url)
                                  : [...prev, repo.html_url]
                              );
                            }}
                            className={`p-3 bg-surface border rounded-lg text-sm transition-colors ${isImported ? 'border-border-light opacity-60' : 'border-border-strong hover:border-brand cursor-pointer'} ${isSelected && !isImported ? 'border-brand bg-brand/5 ring-1 ring-brand' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                <input 
                                  type="checkbox" 
                                  checked={isImported || isSelected} 
                                  disabled={isImported}
                                  onChange={() => {}} // Handle change on parent div
                                  className="w-4 h-4 rounded border-border-strong text-brand focus:ring-brand accent-brand cursor-pointer"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="font-bold text-text-primary truncate">{repo.name}</div>
                                  {isImported && <Badge variant="secondary" className="text-[9px] shrink-0">IMPORTED</Badge>}
                                </div>
                                {repo.description && <div className="text-text-secondary text-xs truncate mt-1">{repo.description}</div>}
                                
                                {/* Real details row */}
                                <div className="flex items-center gap-3 mt-2 text-[10px] font-medium text-text-muted">
                                  {repo.language && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 rounded-full bg-brand" />
                                      <span>{repo.language}</span>
                                    </div>
                                  )}
                                  {repo.stargazers_count > 0 && (
                                    <div className="flex items-center gap-1">
                                      <span>⭐ {repo.stargazers_count}</span>
                                    </div>
                                  )}
                                  {repo.forks_count > 0 && (
                                    <div className="flex items-center gap-1">
                                      <span>🔱 {repo.forks_count}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-text-muted italic">No repositories found in snapshot.</div>
                )}
                {rawGithubSkills.length > 0 && (
                  <div className="pt-2 border-t border-border-light">
                    <div className="text-xs font-bold text-text-secondary mb-3 flex justify-between items-center">
                      <span>SELECT LANGUAGES & SKILLS</span>
                      {selectedGithubSkills.length > 0 && (
                        <Button 
                          size="sm" 
                          onClick={() => {
                            const skillsToImport = rawGithubSkills.filter(s => selectedGithubSkills.includes(s));
                            handleImportSkills(skillsToImport);
                          }}
                          disabled={isImporting}
                          className="h-7 text-xs font-bold rounded-md px-3"
                        >
                          {isImporting ? "Importing..." : `Import ${selectedGithubSkills.length} Selected`}
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rawGithubSkills.map((skillName: string) => {
                        const isImported = importedSkillNames.has(skillName);
                        const isSelected = selectedGithubSkills.includes(skillName);
                        
                        return (
                          <div 
                            key={skillName}
                            onClick={() => {
                              if (isImported) return;
                              setSelectedGithubSkills(prev => 
                                isSelected 
                                  ? prev.filter(s => s !== skillName)
                                  : [...prev, skillName]
                              );
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              isImported 
                                ? 'bg-surface border-border-light text-text-muted opacity-60 cursor-not-allowed' 
                                : isSelected 
                                  ? 'bg-brand/10 border-brand text-brand ring-1 ring-brand cursor-pointer' 
                                  : 'bg-surface border-border-strong text-text-primary hover:border-brand cursor-pointer'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={isImported || isSelected} 
                              disabled={isImported}
                              onChange={() => {}} 
                              className="w-3 h-3 rounded-sm border-border-strong text-brand focus:ring-brand accent-brand cursor-pointer"
                            />
                            {skillName}
                            {isImported && <span className="ml-1 text-[8px] uppercase tracking-wider font-bold">Imported</span>}
                          </div>
                        );
                      })}
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
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
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
