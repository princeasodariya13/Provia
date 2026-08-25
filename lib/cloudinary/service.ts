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

export const CloudinaryService = {
  isConfigured() {
    return !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
  },

  async uploadBuffer(buffer: Buffer, publicId: string, resourceType: "raw" | "image" | "auto" = "auto", mimeType: string = "application/octet-stream"): Promise<{ secureUrl: string; publicId: string; bytes: number }> {
    if (!this.isConfigured()) {
      throw new APIError("Cloudinary is not configured", 501);
    }

    try {
      const b64 = buffer.toString("base64");
      const dataURI = `data:${mimeType};base64,${b64}`;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true,
      });

      return {
        secureUrl: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
      };
    } catch (error: any) {
      console.error("Cloudinary Base64 Upload Error:", error);
      throw new APIError(`Cloudinary upload failed: ${error.message || "Unknown error"}`, 500);
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
