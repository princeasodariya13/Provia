/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { UploadCloud, CheckCircle, AlertCircle, RefreshCw, Camera, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";

export function AvatarUploader({ currentAvatar }: { currentAvatar?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!currentAvatar) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiClient.get<any>(`/api/v1/profile?t=${Date.now()}`).then((res) => {
        if (res.success && res.data?.avatarUrl) {
          setPreview(res.data.avatarUrl);
          setImageError(false);
        }
      });
    } else {
      setPreview(currentAvatar);
      setImageError(false);
    }
  }, [currentAvatar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setImageError(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setSuccess(true);
      setPreview(data.data.avatarUrl);
      setImageError(false);
      setFile(null); // Clear file after successful upload
      toast.success("Profile photo uploaded successfully");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/v1/profile/avatar", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove avatar");
      
      setPreview(null);
      setFile(null);
      setSuccess(true);
      toast.success("Profile photo removed successfully");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to remove avatar");
      toast.error(err.message || "Failed to remove avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <section className="relative bg-surface/60 backdrop-blur-xl border border-border-light rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-500 group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="border-b border-border-light/50 p-5 bg-surface-muted/20 relative z-10">
          <h2 className="text-base font-extrabold text-text-primary tracking-tight">Profile Photo</h2>
        </div>
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-surface-muted border-2 border-surface flex items-center justify-center overflow-hidden shrink-0 shadow-sm ring-1 ring-border-light">
                {preview && !imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={preview} 
                    alt="Avatar Preview" 
                    className="w-full h-full object-cover" 
                    onError={() => {
                      setImageError(true);
                      if (!file) setPreview(null);
                    }}
                  />
                ) : (
                  <Camera className="w-8 h-8 text-text-muted" />
                )}
              </div>
            </div>
            
            <div className="w-full space-y-4">
              <Input type="file" accept="image/jpeg, image/png" onChange={handleFileChange} className="cursor-pointer text-xs h-9 rounded-lg" />
              <div className="flex items-center gap-3 w-full">
                <Button onClick={handleUpload} disabled={!file || uploading} size="sm" className="rounded-full w-full shadow-sm font-bold">
                  {uploading && file ? <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5 mr-2" />}
                  Upload
                </Button>
                {preview && !file && (
                  <Button onClick={() => setIsRemoveModalOpen(true)} disabled={uploading} variant="outline" size="sm" className="rounded-full w-full shadow-sm font-bold text-error hover:bg-error-muted hover:text-error hover:border-error/50 transition-all">
                    {uploading ? <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-2" />} Remove
                  </Button>
                )}
              </div>
              
              {success && <div className="text-success text-xs font-semibold flex items-center justify-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Success</div>}
              {error && <div className="text-error text-xs font-semibold flex items-center justify-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> {error}</div>}
            </div>
          </div>
        </CardContent>
      </section>

      <ConfirmModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onConfirm={handleRemove}
        title="Remove Profile Photo"
        description="Are you sure you want to permanently remove your profile photo? This action cannot be undone."
        confirmText="Remove Photo"
      />
    </>
  );
}
