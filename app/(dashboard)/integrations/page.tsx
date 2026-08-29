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
  rawSnapshots?: { data: string }[];
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
  const [expandedRepos, setExpandedRepos] = useState<string[]>([]);

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

  const handleSyncRepos = async (reposToSync: any[]) => {
    setIsImporting(true);
    try {
      const res = await apiClient.post("/api/v1/integrations/github/sync-repos", {
        repositories: reposToSync
      });
      if (res.success) {
        // Refresh profile
        const profileRes = await apiClient.get<any>(`/api/v1/profile?t=${Date.now()}`);
        if (profileRes.success && profileRes.data) setProfile(profileRes.data);
      } else {
        setError(res.error || "Failed to sync repositories");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to sync repositories");
    } finally {
      setIsImporting(false);
    }
  };

  const handleSyncSkills = async (skillsToSync: string[]) => {
    setIsImporting(true);
    try {
      const res = await apiClient.post("/api/v1/integrations/github/sync-skills", {
        skills: skillsToSync
      });
      if (res.success) {
        // Refresh profile
        const profileRes = await apiClient.get<any>(`/api/v1/profile?t=${Date.now()}`);
        if (profileRes.success && profileRes.data) setProfile(profileRes.data);
      } else {
        setError(res.error || "Failed to sync languages");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to sync languages");
    } finally {
      setIsImporting(false);
    }
  };

  // Initialize selection state based on imported data if it hasn't been modified yet
  useEffect(() => {
    if (!profile) return;
    
    // Check local raw snapshots to correctly identify merged items during initialization
    const state = sessionStorage.getItem("oauth_state"); // just a dummy hook to keep React happy, we use the parsed raw data below in render, but for initialization we can just derive it again
    
    const githubState = connections.find((c) => c.provider === "GITHUB");
    let rawSkills: string[] = [];
    if (githubState?.rawSnapshots?.[0]?.data) {
      try {
        const rawData = JSON.parse(githubState.rawSnapshots[0].data);
        rawSkills = rawData.derived_skills || [];
      } catch(e) {}
    }

    const ghProjects = profile.projects?.filter((p: any) => 
      p.source === "GITHUB" || (p.externalId && p.externalId.includes("github.com"))
    ) || [];
    
    const ghSkills = profile.skills?.filter((s: any) => 
      s.source === "GITHUB" || rawSkills.includes(s.name)
    ) || [];
    
    const importedRepoUrls = new Set(ghProjects.map((p: any) => p.repositoryUrl || p.externalId));
    const importedSkillNames = new Set(ghSkills.map((s: any) => s.name));

    if (ghProjects.length > 0 && selectedGithubRepos.length === 0) {
      setSelectedGithubRepos(Array.from(importedRepoUrls) as string[]);
    }
    if (ghSkills.length > 0 && selectedGithubSkills.length === 0) {
      setSelectedGithubSkills(Array.from(importedSkillNames) as string[]);
    }
  }, [profile, connections]);

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

  // Parse raw github repositories first to use them for accurate filtering
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

  let rawLinkedinData: any = null;
  if (linkedinState.rawSnapshots?.[0]?.data) {
    try {
      rawLinkedinData = JSON.parse(linkedinState.rawSnapshots[0].data);
    } catch(e) {}
  }

  // Include projects that were merged (have github externalId) and skills that overlap
  const githubProjects = profile?.projects?.filter((p: any) => 
    p.source === "GITHUB" || (p.externalId && p.externalId.includes("github.com"))
  ) || [];
  
  const githubSkills = profile?.skills?.filter((s: any) => 
    s.source === "GITHUB"
  ) || [];
  
  const linkedinExperiences = profile?.experiences?.filter((e: any) => e.source === "LINKEDIN") || [];
  const linkedinSkills = profile?.skills?.filter((s: any) => s.source === "LINKEDIN") || [];

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
                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-bold text-text-secondary flex justify-between items-center">
                        <span>SELECT REPOSITORIES TO SYNC</span>
                        <div className="flex items-center gap-2">
                          <button 
                            className="text-[10px] text-text-muted hover:text-brand underline"
                            onClick={() => {
                              if (selectedGithubRepos.length === rawGithubRepos.length) {
                                setSelectedGithubRepos([]);
                              } else {
                                setSelectedGithubRepos(rawGithubRepos.map((r: any) => r.html_url));
                              }
                            }}
                          >
                            {selectedGithubRepos.length === rawGithubRepos.length ? "Deselect All" : "Select All"}
                          </button>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              const reposToSync = rawGithubRepos.filter((r: any) => selectedGithubRepos.includes(r.html_url));
                              handleSyncRepos(reposToSync);
                            }}
                            disabled={isImporting}
                            className="h-7 text-xs font-bold rounded-md px-3 bg-white text-brand border border-brand hover:bg-brand/10 hover:text-brand"
                          >
                            {isImporting ? "Saving..." : `Save Changes`}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div 
                      className="space-y-2 max-h-[300px] overflow-y-auto overscroll-contain pr-2 custom-scrollbar"
                      onWheel={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                    >
                      {rawGithubRepos.map((repo: any) => {
                        const isImported = importedRepoUrls.has(repo.html_url);
                        const isSelected = selectedGithubRepos.includes(repo.html_url);
                        const isExpanded = expandedRepos.includes(repo.html_url);
                        
                        return (
                          <div 
                            key={repo.html_url} 
                            className={`p-3 bg-surface border rounded-lg text-sm transition-colors ${isSelected ? 'border-brand bg-brand/5 ring-1 ring-brand' : 'border-border-strong hover:border-brand/50'}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                <input 
                                  type="checkbox" 
                                  checked={isSelected} 
                                  onChange={() => {
                                    setSelectedGithubRepos(prev => 
                                      isSelected 
                                        ? prev.filter(url => url !== repo.html_url)
                                        : [...prev, repo.html_url]
                                    );
                                  }}
                                  className="w-4 h-4 rounded border-border-strong text-brand focus:ring-brand accent-brand cursor-pointer"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div 
                                  className="flex items-center justify-between gap-2 cursor-pointer select-none"
                                  onClick={() => {
                                    setExpandedRepos(prev => 
                                      isExpanded 
                                        ? prev.filter(url => url !== repo.html_url)
                                        : [...prev, repo.html_url]
                                    );
                                  }}
                                >
                                  <div className="font-bold text-text-primary truncate">{repo.name}</div>
                                  <div className="text-xs text-text-muted hover:text-text-primary">
                                    {isExpanded ? "Hide Details" : "View Details"}
                                  </div>
                                </div>
                                
                                {isExpanded && (
                                  <div className="mt-3 pt-3 border-t border-border-light/50 animate-in slide-in-from-top-2">
                                    {repo.description && <div className="text-text-secondary text-xs mb-3 leading-relaxed">{repo.description}</div>}
                                    
                                    {/* Real details row */}
                                    <div className="flex items-center gap-3 text-[10px] font-medium text-text-muted bg-surface-muted p-2 rounded-md">
                                      {repo.language && (
                                        <div className="flex items-center gap-1">
                                          <div className="w-2 h-2 rounded-full bg-brand" />
                                          <span>{repo.language}</span>
                                        </div>
                                      )}
                                      {(repo.topics && repo.topics.length > 0) || (repo.all_languages && repo.all_languages.length > 0) ? (
                                        <div className="flex flex-wrap gap-2">
                                          {Array.from(new Set([...(repo.topics || []), ...(repo.all_languages || [])])).filter((t: any) => t !== repo.language).map((topic: any) => (
                                            <div key={topic} className="flex items-center gap-1">
                                              <div className="w-2 h-2 rounded-full bg-brand/50" />
                                              <span>{topic}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : null}
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
                                )}
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
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="text-xs font-bold text-text-secondary flex justify-between items-center">
                        <span>SELECT LANGUAGES & SKILLS</span>
                        <div className="flex items-center gap-2">
                          <button 
                            className="text-[10px] text-text-muted hover:text-brand underline"
                            onClick={() => {
                              if (selectedGithubSkills.length === rawGithubSkills.length) {
                                setSelectedGithubSkills([]);
                              } else {
                                setSelectedGithubSkills([...rawGithubSkills]);
                              }
                            }}
                          >
                            {selectedGithubSkills.length === rawGithubSkills.length ? "Deselect All" : "Select All"}
                          </button>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              const skillsToSync = rawGithubSkills.filter(s => selectedGithubSkills.includes(s));
                              handleSyncSkills(skillsToSync);
                            }}
                            disabled={isImporting}
                            className="h-7 text-xs font-bold rounded-md px-3 bg-white text-brand border border-brand hover:bg-brand/10 hover:text-brand"
                          >
                            {isImporting ? "Saving..." : `Save Changes`}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rawGithubSkills.map((skillName: string) => {
                        const isSelected = selectedGithubSkills.includes(skillName);
                        
                        return (
                          <div 
                            key={skillName}
                            onClick={() => {
                              setSelectedGithubSkills(prev => 
                                isSelected 
                                  ? prev.filter(s => s !== skillName)
                                  : [...prev, skillName]
                              );
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-brand/10 border-brand text-brand ring-1 ring-brand' 
                                : 'bg-surface border-border-strong text-text-primary hover:border-brand/50'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={isSelected} 
                              onChange={() => {}} 
                              className="w-3 h-3 rounded-sm border-border-strong text-brand focus:ring-brand accent-brand cursor-pointer"
                            />
                            {skillName}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {(githubProjects.length > 0 || githubSkills.length > 0) && (
                  <div className="pt-6 mt-6 border-t border-border-strong border-dashed">
                    <div className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Currently in Portfolio
                    </div>
                    
                    {githubProjects.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {githubProjects.map((p: any) => (
                          <div key={p.id} className="p-3 bg-surface-muted border border-border-light rounded-lg text-sm flex items-center justify-between">
                            <div className="font-bold text-text-primary truncate">{p.name}</div>
                            <Badge variant="success" className="text-[9px]">LIVE</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {githubSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {githubSkills.map((s: any) => (
                          <Badge key={s.id} variant="secondary" className="text-[10px] bg-brand/5 border-brand/20 text-brand">
                            {s.name}
                          </Badge>
                        ))}
                      </div>
                    )}
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
          description="Verify your professional identity and instantly sync your basic profile data (Name, Photo, Headline)."
          state={linkedinState}
          onConnect={() => handleConnect("LINKEDIN")}
          connectedIcon={<CheckCircle2 className="w-4 h-4 mr-2" />}
          connectedLabel="Identity Verified"
          syncedData={
            (linkedinState.state === "SYNCED" || linkedinState.state === "CONNECTED") && rawLinkedinData ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-4 p-4 bg-surface border border-border-light rounded-xl">
                  {rawLinkedinData.picture ? (
                    <img src={rawLinkedinData.picture} alt="Profile" className="w-12 h-12 rounded-full border border-border-strong object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center border border-border-strong">
                      <Briefcase className="w-5 h-5 text-text-muted" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-text-primary text-sm truncate">{rawLinkedinData.name}</h4>
                      <Badge variant="success" className="text-[9px] h-4">VERIFIED</Badge>
                    </div>
                    {rawLinkedinData.headline && (
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">{rawLinkedinData.headline}</p>
                    )}
                    {rawLinkedinData.linkedin_profile_url && (
                      <a href={rawLinkedinData.linkedin_profile_url} target="_blank" rel="noreferrer" className="text-xs text-brand hover:underline mt-1 inline-block">
                        View LinkedIn Profile
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-brand/5 border border-brand/20 rounded-lg flex items-start gap-3">
                  <div className="p-1.5 bg-brand/10 rounded-md">
                    <Briefcase className="w-4 h-4 text-brand" />
                  </div>
                  <div className="text-xs text-text-secondary leading-relaxed">
                    <span className="font-bold text-text-primary block mb-0.5">Where is my timeline?</span>
                    LinkedIn strictly limits 3rd-party access to full professional timelines. To import your complete work experience and education, we recommend using our <span className="font-bold text-brand">Smart Resume Upload</span> in the Portfolio Studio.
                  </div>
                </div>
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
