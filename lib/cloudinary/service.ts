import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";
import { APIError } from "@/lib/errors";

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: env.CLOUDINARY_API_KEY.trim(),
    api_secret: env.CLOUDINARY_API_SECRET.trim(),
  });
}

import { Readable } from "stream";

export const CloudinaryService = {
  isConfigured() {
    return !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
  },

  async uploadBuffer(buffer: Buffer, publicId: string, resourceType: "raw" | "image" | "auto" = "auto", mimeType: string = "application/octet-stream"): Promise<{ secureUrl: string; publicId: string; bytes: number }> {
    if (!this.isConfigured()) {
      throw new APIError("Cloudinary is not configured", 501);
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request({
      timestamp,
      public_id: publicId,
      overwrite: true,
    }, env.CLOUDINARY_API_SECRET!);

    const formData = new FormData();
    // Use a native Blob for the file
    formData.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType }), "file");
    formData.append("api_key", env.CLOUDINARY_API_KEY!);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("public_id", publicId);
    formData.append("overwrite", "true");

    const endpoint = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME!}/${resourceType}/upload`;
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorObj;
        try {
          errorObj = JSON.parse(responseText);
        } catch {
          errorObj = { message: responseText };
        }

        const diagnosticError = {
          status: response.status,
          message: errorObj.error?.message || errorObj.message || "Unknown Cloudinary error",
          resourceType,
          mimeType,
          fileSize: buffer.length,
          cloudNameConfigured: !!env.CLOUDINARY_CLOUD_NAME,
          apiKeyConfigured: !!env.CLOUDINARY_API_KEY,
          apiSecretConfigured: !!env.CLOUDINARY_API_SECRET,
          rawError: responseText,
          endpoint
        };
        
        console.error("CloudinaryUploadDiagnostic:", JSON.stringify(diagnosticError, null, 2));
        throw new APIError(`Cloudinary upload failed: ${diagnosticError.message}`, response.status);
      }

      const result = JSON.parse(responseText);
      return {
        secureUrl: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
      };
    } catch (err: any) {
      if (err instanceof APIError) throw err;
      console.error("Cloudinary Fetch Error:", err);
      throw new APIError(`Cloudinary upload failed: ${err.message}`, 500);
    }
  },

  async destroyAsset(publicId: string, resourceType: "raw" | "image" | "auto" = "image"): Promise<void> {
    if (!this.isConfigured()) return;
    
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
      // Log but do not fail
      console.error(`Failed to destroy Cloudinary asset ${publicId}:`, err);
    }
  }
};
