"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, CheckCircle, AlertCircle, RefreshCw, FileText, Sparkles, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";

export function ResumeIntelligence() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const toast = useToast();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resumeData, setResumeData] = useState<any>(null);
  const [status, setStatus] = useState<string>("NONE");
  const [expanded, setExpanded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const handleUpload = () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);
    setUploadSuccessMsg(false);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/v1/profile/resume");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        setUploadProgress(100);
        setUploadSuccessMsg(true);
        setFile(null);
        toast.success("Resume uploaded successfully");
        
        setTimeout(async () => {
          setUploadSuccessMsg(false);
          setStatus(data.data.status);
          await fetchResumeStatus();
          setUploading(false);
          setUploadProgress(null);
        }, 2000);
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setError(data.error || "Upload failed");
          toast.error(data.error || "Upload failed");
        } catch {
          setError("Upload failed");
          toast.error("Upload failed");
        }
        setUploading(false);
        setUploadProgress(null);
      }
    };

    xhr.onerror = () => {
      setError("Network error occurred during upload");
      toast.error("Network error occurred during upload");
      setUploading(false);
      setUploadProgress(null);
    };

    xhr.send(formData);
  };

  const toggleSelection = (category: string, idx?: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSelections((prev: any) => {
      const newSel = { ...prev };
      if (idx === undefined) {
        newSel[category] = !newSel[category];
      } else {
        if (newSel[category].includes(idx)) {
          newSel[category] = newSel[category].filter((i: number) => i !== idx);
        } else {
          newSel[category].push(idx);
        }
      }
      return newSel;
    });
  };

  const handleApply = async () => {
    setApplying(true);
    setApplySuccess(false);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.post<any>("/api/v1/profile/resume/apply", {
      resumeId: resumeData?.id || resumeData?.resumeId,  // support both field names
      selections,
    });
    
    if (res.success) {
      setApplySuccess(true);
      toast.success("Resume data imported successfully!");
      setTimeout(() => {
        setExpanded(false);
        setApplySuccess(false);
        window.location.reload();
      }, 2000);
    } else {
      toast.error(res.error || "Failed to apply data.");
    }
    setApplying(false);
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const res = await fetch("/api/v1/profile/resume", { method: "DELETE" });
      if (res.ok) {
        setResumeData(null);
        setStatus("NONE");
        setFile(null);
        toast.success("Resume removed successfully");
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to remove resume.");
      }
    } catch {
      toast.error("Error removing resume.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
    <section className="relative bg-surface/60 backdrop-blur-xl border border-border-light rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-500 group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="border-b border-border-light/50 p-5 bg-surface-muted/20 flex items-center justify-between relative z-10">
        <h2 className="text-base font-extrabold text-text-primary tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand" /> Resume Intelligence
        </h2>
        {status !== "NONE" && (
          <Badge variant={status === "COMPLETED" ? "success" : "warning"} className="text-[10px] px-2 py-0 uppercase">
            {status}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-6 relative z-10">
        {removing ? (
          <div className="flex flex-col items-center gap-4 text-center py-6 w-full animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center animate-pulse">
              <Trash2 className="w-8 h-8 text-error" />
            </div>
            <div className="w-full max-w-[200px] space-y-2">
              <h3 className="text-sm font-bold text-text-primary">Removing Resume...</h3>
            </div>
          </div>
        ) : uploadSuccessMsg ? (
          <div className="flex flex-col items-center gap-4 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Upload Successful!</h3>
              <p className="text-xs text-text-secondary">Initializing AI engine...</p>
            </div>
          </div>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-4 text-center py-6 w-full animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center animate-pulse">
              <UploadCloud className="w-8 h-8 text-brand" />
            </div>
            <div className="w-full max-w-[200px] space-y-2">
              <h3 className="text-sm font-bold text-text-primary">Uploading... {uploadProgress || 0}%</h3>
              <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-brand transition-all duration-300 ease-out" style={{ width: `${uploadProgress || 0}%` }} />
              </div>
            </div>
          </div>
        ) : status === "NONE" || status === "FAILED" ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center">
              <FileText className="w-8 h-8 text-text-muted" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-text-primary">Upload PDF Resume</h3>
              <p className="text-xs text-text-secondary max-w-[200px] mx-auto">Extract experiences and skills automatically.</p>
            </div>
            
            <div className="w-full space-y-3 mt-2">
              <Input type="file" accept="application/pdf" onChange={handleFileChange} className="cursor-pointer text-xs h-9 rounded-lg bg-surface/50 border-border-light hover:border-border transition-colors" />
              <Button onClick={handleUpload} disabled={!file || uploading} size="sm" className="w-full rounded-full shadow-sm font-bold bg-brand hover:bg-brand-hover hover:-translate-y-0.5 transition-all">
                <UploadCloud className="w-4 h-4 mr-2" />
                Process Resume
              </Button>
              {error && <div className="text-error text-xs font-semibold text-center">{error}</div>}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 border border-border-light bg-surface-muted/30 rounded-xl relative group/resume">
              <FileText className="w-8 h-8 text-brand shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-text-primary truncate">{resumeData?.filename}</p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {(resumeData?.size / 1024).toFixed(1)} KB • Uploaded {new Date(resumeData?.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button onClick={() => setIsRemoveModalOpen(true)} disabled={uploading} variant="ghost" size="icon" className="text-error hover:bg-error-muted hover:text-error transition-opacity">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {status === "QUEUED" || status === "PROCESSING" ? (
              <div className="p-5 text-center bg-brand-muted/20 border border-brand/20 rounded-xl space-y-3">
                <RefreshCw className="w-6 h-6 text-brand animate-spin mx-auto" />
                <div>
                  <p className="font-bold text-sm text-brand">AI Processing</p>
                  <p className="text-xs text-brand/70 mt-1">Extracting structured data from your PDF...</p>
                </div>
              </div>
            ) : status === "COMPLETED" ? (
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={() => setExpanded(!expanded)} 
                  className="w-full rounded-xl flex justify-between shadow-sm"
                >
                  <span className="font-bold">Review Extracted Data</span>
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>

                <div className="text-center">
                  <span className="text-[10px] text-text-secondary">Or</span>
                </div>

                <div className="relative">
                  <Input type="file" accept="application/pdf" onChange={handleFileChange} className="cursor-pointer text-xs h-9 rounded-lg" />
                  {file && (
                    <Button onClick={handleUpload} disabled={uploading} size="sm" className="w-full rounded-full shadow-sm font-bold bg-text-primary text-background hover:bg-text-primary/90 mt-2">
                      {uploading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                      Process New Resume
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>

      {/* Expanded Review Section */}
      {expanded && resumeData?.extractedData && (
        <div className="border-t border-border-light bg-surface-muted/10 p-5 space-y-6">
          <div className="bg-warning-muted/30 border border-warning/30 p-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-warning-strong">Select the items below that you want to import into your Provia profile. Existing data will not be overwritten automatically.</p>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            
            {resumeData.extractedData.personalInfo && (
              <div className="space-y-2 border border-border-light p-4 rounded-xl bg-surface shadow-sm hover:border-brand-hover transition-colors">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={selections.personalInfo} onChange={() => toggleSelection("personalInfo")} className="w-4 h-4 accent-brand rounded border-border" />
                  <span className="font-bold text-sm text-text-primary">Personal Info</span>
                </label>
                {selections.personalInfo && (
                  <div className="pl-7 text-xs text-text-secondary space-y-1">
                    <p>Name: {resumeData.extractedData.personalInfo.fullName}</p>
                    <p>Email: {resumeData.extractedData.personalInfo.email}</p>
                    <p>Location: {resumeData.extractedData.personalInfo.location}</p>
                  </div>
                )}
              </div>
            )}

            {resumeData.extractedData.experiences?.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-widest text-text-muted pl-1">Experience ({resumeData.extractedData.experiences.length})</h4>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {resumeData.extractedData.experiences.map((exp: any, i: number) => (
                  <div key={i} className="space-y-2 border border-border-light p-4 rounded-xl bg-surface shadow-sm hover:border-brand-hover transition-colors">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={selections.experience.includes(i)} onChange={() => toggleSelection("experience", i)} className="w-4 h-4 accent-brand rounded border-border mt-0.5" />
                      <div>
                        <span className="font-bold text-sm text-text-primary">{exp.title}</span>
                        <p className="text-xs font-semibold text-text-secondary">{exp.company}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {resumeData.extractedData.skills?.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-widest text-text-muted pl-1">Skills ({resumeData.extractedData.skills.length})</h4>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {resumeData.extractedData.skills.map((skill: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 border border-border-light p-3 rounded-lg bg-surface shadow-sm hover:border-brand-hover transition-colors">
                    <input type="checkbox" checked={selections.skills.includes(i)} onChange={() => toggleSelection("skills", i)} className="w-4 h-4 accent-brand rounded border-border" />
                    <span className="text-xs font-bold text-text-primary">{skill.name}</span>
                  </div>
                ))}
              </div>
            )}
            {resumeData.extractedData.summary && (
              <div className="space-y-2 border border-border-light p-4 rounded-xl bg-surface shadow-sm hover:border-brand-hover transition-colors">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={selections.summary} onChange={() => toggleSelection("summary")} className="w-4 h-4 accent-brand rounded border-border" />
                  <span className="font-bold text-sm text-text-primary">Professional Summary</span>
                </label>
                {selections.summary && (
                  <div className="pl-7 text-xs text-text-secondary">
                    <p className="line-clamp-3">{resumeData.extractedData.summary}</p>
                  </div>
                )}
              </div>
            )}

            {resumeData.extractedData.education?.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-widest text-text-muted pl-1">Education ({resumeData.extractedData.education.length})</h4>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {resumeData.extractedData.education.map((edu: any, i: number) => (
                  <div key={i} className="space-y-2 border border-border-light p-4 rounded-xl bg-surface shadow-sm hover:border-brand-hover transition-colors">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={selections.education.includes(i)} onChange={() => toggleSelection("education", i)} className="w-4 h-4 accent-brand rounded border-border mt-0.5" />
                      <div>
                        <span className="font-bold text-sm text-text-primary">{edu.institution}</span>
                        <p className="text-xs font-semibold text-text-secondary">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {resumeData.extractedData.projects?.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-widest text-text-muted pl-1">Projects ({resumeData.extractedData.projects.length})</h4>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {resumeData.extractedData.projects.map((proj: any, i: number) => (
                  <div key={i} className="space-y-2 border border-border-light p-4 rounded-xl bg-surface shadow-sm hover:border-brand-hover transition-colors">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={selections.projects.includes(i)} onChange={() => toggleSelection("projects", i)} className="w-4 h-4 accent-brand rounded border-border mt-0.5" />
                      <div>
                        <span className="font-bold text-sm text-text-primary">{proj.name}</span>
                        <p className="text-xs font-semibold text-text-secondary line-clamp-1">{proj.description}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {resumeData.extractedData.certifications?.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-widest text-text-muted pl-1">Certifications ({resumeData.extractedData.certifications.length})</h4>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {resumeData.extractedData.certifications.map((cert: any, i: number) => (
                  <div key={i} className="space-y-2 border border-border-light p-4 rounded-xl bg-surface shadow-sm hover:border-brand-hover transition-colors">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={selections.certifications.includes(i)} onChange={() => toggleSelection("certifications", i)} className="w-4 h-4 accent-brand rounded border-border mt-0.5" />
                      <div>
                        <span className="font-bold text-sm text-text-primary">{cert.name}</span>
                        <p className="text-xs font-semibold text-text-secondary">{cert.issuer}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {resumeData.extractedData.links?.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-widest text-text-muted pl-1">Links ({resumeData.extractedData.links.length})</h4>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {resumeData.extractedData.links.map((link: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 border border-border-light p-3 rounded-lg bg-surface shadow-sm hover:border-brand-hover transition-colors">
                    <input type="checkbox" checked={selections.links.includes(i)} onChange={() => toggleSelection("links", i)} className="w-4 h-4 accent-brand rounded border-border" />
                    <span className="text-xs font-bold text-text-primary">{link.platform}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border-light">
            <Button onClick={handleApply} disabled={applying} className="w-full rounded-full font-bold shadow-sm" size="lg">
              {applying ? "Importing Data..." : "Import Selected Data"}
            </Button>
            {applySuccess && (
              <p className="text-success text-xs font-bold text-center mt-3 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" /> Successfully imported to profile
              </p>
            )}
          </div>
        </div>
      )}
    </section>

    <ConfirmModal
      isOpen={isRemoveModalOpen}
      onClose={() => setIsRemoveModalOpen(false)}
      onConfirm={handleRemove}
      title="Remove Resume"
      description="Are you sure you want to permanently remove your uploaded resume? This action cannot be undone."
      confirmText="Remove Resume"
    />
    </>
  );
}
