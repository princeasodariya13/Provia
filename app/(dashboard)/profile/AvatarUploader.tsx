"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export function AvatarUploader({ currentAvatar }: { currentAvatar?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);

  useEffect(() => {
    if (!currentAvatar) {
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
        // No Content-Type header so browser sets multipart boundary
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
    <Card className="border-border-strong rounded-none">
      <CardContent className="pt-6 flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-surface border border-border-strong flex items-center justify-center overflow-hidden shrink-0">
          {preview ? (
            <img src={preview} alt="Avatar Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-text-secondary text-xs">No Photo</span>
          )}
        </div>
        <div className="space-y-4 flex-1">
          <Input type="file" accept="image/jpeg, image/png" onChange={handleFileChange} className="rounded-none cursor-pointer" />
          <div className="flex items-center gap-4">
            <Button onClick={handleUpload} disabled={!file || uploading} className="rounded-none">
              {uploading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
              Upload Photo
            </Button>
            {success && <span className="text-success text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Updated</span>}
            {error && <span className="text-error text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {error}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
