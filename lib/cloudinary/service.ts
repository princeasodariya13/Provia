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

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: resourceType,
          overwrite: true,
        },
        (error: any, result: any) => {
          if (error) {
            const diagnosticError = {
              status: error.http_code || error.statusCode || 403, // Fallback to 403 if it was rejected
              message: error.message || "Unknown Cloudinary error",
              resourceType,
              mimeType,
              fileSize: buffer.length,
              cloudNameConfigured: !!env.CLOUDINARY_CLOUD_NAME,
              apiKeyConfigured: !!env.CLOUDINARY_API_KEY,
              apiSecretConfigured: !!env.CLOUDINARY_API_SECRET,
              rawError: typeof error === "object" ? JSON.stringify(error) : String(error)
            };
            
            
            console.error("CloudinaryUploadDiagnostic:", JSON.stringify(diagnosticError, null, 2));
            
            reject(new APIError(`Cloudinary upload failed: ${diagnosticError.message}`, diagnosticError.status));
          } else if (result) {
            resolve({
              secureUrl: result.secure_url,
              publicId: result.public_id,
              bytes: result.bytes,
            });
          } else {
            reject(new APIError("Unknown Cloudinary error", 500));
          }
        }
      );
      
      // Use Readable.from to prevent Vercel serverless hangs caused by uploadStream.end()
      Readable.from(buffer).pipe(uploadStream);
    });
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
