/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { UploadCloud, CheckCircle, AlertCircle, RefreshCw, Camera } from "lucide-react";

export function AvatarUploader({ currentAvatar }: { currentAvatar?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);

  useEffect(() => {
    if (!currentAvatar) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiClient.get<any>("/api/v1/profile").then((res) => {
        if (res.success && res.data?.avatarUrl) {
          setPreview(res.data.avatarUrl);
        }
      });
    }
  }, [currentAvatar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
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
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="bg-surface border border-border-light rounded-2xl overflow-hidden shadow-sm">
      <div className="border-b border-border-light p-5 bg-surface-muted/30">
        <h2 className="text-base font-bold text-text-primary">Profile Photo</h2>
      </div>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-surface-muted border-2 border-surface flex items-center justify-center overflow-hidden shrink-0 shadow-sm ring-1 ring-border-light">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-text-muted" />
              )}
            </div>
          </div>
          
          <div className="w-full space-y-4">
            <Input type="file" accept="image/jpeg, image/png" onChange={handleFileChange} className="cursor-pointer text-xs h-9 rounded-lg" />
            <div className="flex items-center gap-3 w-full">
              <Button onClick={handleUpload} disabled={!file || uploading} size="sm" className="rounded-full w-full shadow-sm font-bold">
                {uploading ? <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5 mr-2" />}
                Upload
              </Button>
            </div>
            
            {success && <div className="text-success text-xs font-semibold flex items-center justify-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Uploaded successfully</div>}
            {error && <div className="text-error text-xs font-semibold flex items-center justify-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> {error}</div>}
          </div>
        </div>
      </CardContent>
    </section>
  );
}
