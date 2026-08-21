/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, CheckCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

export function ResumeIntelligence() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [resumeData, setResumeData] = useState<any>(null);
  const [status, setStatus] = useState<string>("NONE");
  const [expanded, setExpanded] = useState(false);
  const [selections, setSelections] = useState<any>({
    personalInfo: false,
    summary: false,
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    links: [],
  });

  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const fetchResumeStatus = async () => {
    const res = await apiClient.get<any>("/api/v1/profile/resume");
    if (res.success && res.data) {
      setResumeData(res.data);
      setStatus(res.data.status);
    } else {
      setStatus("NONE");
    }
  };

  useEffect(() => {
    let isMounted = true;
    apiClient.get<any>("/api/v1/profile/resume").then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setResumeData(res.data);
        setStatus(res.data.status);
      } else {
        setStatus("NONE");
      }
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "QUEUED" || status === "PROCESSING") {
      interval = setInterval(fetchResumeStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/profile/resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setStatus(data.data.status);
      setFile(null);
      await fetchResumeStatus();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  const toggleSelection = (category: string, idx?: number) => {
    setSelections((prev: any) => {
      const newSel = { ...prev };
      if (idx !== undefined) {
        if (newSel[category].includes(idx)) {
          newSel[category] = newSel[category].filter((i: number) => i !== idx);
        } else {
          newSel[category] = [...newSel[category], idx];
        }
      } else {
        newSel[category] = !newSel[category];
      }
      return newSel;
    });
  };

  const handleApply = async () => {
    setApplying(true);
    setApplySuccess(false);
    setError(null);

    const res = await apiClient.post("/api/v1/profile/resume/apply", {
      resumeId: resumeData.resumeId,
      selections,
    });

    if (res.success) {
      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        window.location.reload(); // Quick refresh to load imported profile data into ProfileForm
      }, 1500);
    } else {
      setError(res.error || "Failed to apply resume data");
    }
    setApplying(false);
  };

  return (
    <Card className="border-border-strong rounded-none">
      <CardHeader className="border-b border-border-strong bg-surface">
        <CardTitle>Resume Intelligence</CardTitle>
        <p className="text-text-secondary text-sm">Upload your PDF resume to automatically populate your professional profile.</p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        
        <div className="flex items-center gap-4">
          <Input type="file" accept="application/pdf" onChange={handleFileChange} className="rounded-none cursor-pointer max-w-sm" />
          <Button onClick={handleUpload} disabled={!file || uploading} className="rounded-none">
            {uploading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
            Upload Resume
          </Button>
        </div>

        {error && <div className="text-error border border-error p-4 bg-error/10 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}

        {status === "QUEUED" || status === "PROCESSING" ? (
          <div className="p-6 bg-surface border border-border-strong text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-accent" />
            <p className="font-semibold text-lg animate-pulse">Analyzing Resume...</p>
          </div>
        ) : status === "FAILED" ? (
          <div className="p-4 bg-error/10 border border-error text-error text-sm">
            <p className="font-bold mb-1">Extraction Failed</p>
            <p>{resumeData?.extractionError || "Could not extract data from the provided PDF."}</p>
          </div>
        ) : status === "COMPLETED" && resumeData?.structuredData ? (
          <div className="border border-border-strong">
            <div className="p-4 flex justify-between items-center bg-surface border-b border-border-strong cursor-pointer" onClick={() => setExpanded(!expanded)}>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-success w-5 h-5" />
                <div>
                  <p className="font-bold">Ready for Review</p>
                  <p className="text-xs text-text-secondary">Your existing profile will not be overwritten automatically.</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">{expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</Button>
            </div>
            
            {expanded && (
              <div className="p-4 space-y-6">
                
                {/* Review Categories */}
                <div className="space-y-4">
                  {resumeData.structuredData.personalInfo && (
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={selections.personalInfo} onChange={() => toggleSelection("personalInfo")} className="mt-1" />
                      <div>
                        <p className="font-semibold">Personal Info</p>
                        <p className="text-sm text-text-secondary">{resumeData.structuredData.personalInfo.fullName} • {resumeData.structuredData.personalInfo.location}</p>
                      </div>
                    </div>
                  )}

                  {resumeData.structuredData.summary && (
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={selections.summary} onChange={() => toggleSelection("summary")} className="mt-1" />
                      <div>
                        <p className="font-semibold">Summary</p>
                        <p className="text-sm text-text-secondary line-clamp-2">{resumeData.structuredData.summary}</p>
                      </div>
                    </div>
                  )}

                  {resumeData.structuredData.experience?.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold">Experience</p>
                      {resumeData.structuredData.experience.map((exp: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 ml-4">
                          <input type="checkbox" checked={selections.experience.includes(idx)} onChange={() => toggleSelection("experience", idx)} className="mt-1" />
                          <p className="text-sm text-text-secondary"><span className="font-medium text-text">{exp.title}</span> at {exp.company}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resumeData.structuredData.education?.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold">Education</p>
                      {resumeData.structuredData.education.map((edu: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 ml-4">
                          <input type="checkbox" checked={selections.education.includes(idx)} onChange={() => toggleSelection("education", idx)} className="mt-1" />
                          <p className="text-sm text-text-secondary"><span className="font-medium text-text">{edu.degree}</span> at {edu.institution}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resumeData.structuredData.skills?.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold">Skills</p>
                      <div className="ml-4 flex flex-wrap gap-2">
                        {resumeData.structuredData.skills.map((skill: any, idx: number) => (
                          <label key={idx} className="flex items-center gap-1 bg-surface px-2 py-1 text-xs border border-border-strong cursor-pointer hover:bg-border-strong/50">
                            <input type="checkbox" checked={selections.skills.includes(idx)} onChange={() => toggleSelection("skills", idx)} />
                            {skill.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* (Truncated detailed projects/certs for brevity, but similar pattern) */}
                  {resumeData.structuredData.projects?.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold">Projects</p>
                      {resumeData.structuredData.projects.map((proj: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 ml-4">
                          <input type="checkbox" checked={selections.projects.includes(idx)} onChange={() => toggleSelection("projects", idx)} className="mt-1" />
                          <p className="text-sm text-text-secondary"><span className="font-medium text-text">{proj.name}</span></p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border-strong flex items-center justify-end gap-4">
                  {applySuccess && <span className="text-success text-sm font-medium">Profile Imported Successfully!</span>}
                  <Button onClick={handleApply} disabled={applying} className="rounded-none font-bold">
                    {applying ? "Importing..." : "Import Selected to Profile"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}

      </CardContent>
    </Card>
  );
}
