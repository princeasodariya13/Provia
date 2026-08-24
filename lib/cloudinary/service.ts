import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";
import { APIError } from "@/lib/errors";

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export const CloudinaryService = {
  isConfigured() {
    return !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
  },

  async uploadBuffer(buffer: Buffer, publicId: string, resourceType: "raw" | "image" | "auto" = "auto"): Promise<{ secureUrl: string; publicId: string; bytes: number }> {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error: any, result: any) => {
          if (error) {
            reject(new APIError(`Cloudinary upload failed: ${error.message}`, 500));
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
      
      uploadStream.end(buffer);
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
