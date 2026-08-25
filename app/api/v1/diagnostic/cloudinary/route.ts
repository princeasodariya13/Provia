import { NextResponse } from "next/server";
import { CloudinaryService } from "@/lib/cloudinary/service";
import { env } from "@/lib/env";

export async function GET() {
  const diagnostic = {
    cloudNamePresent: !!env.CLOUDINARY_CLOUD_NAME,
    cloudNameLength: env.CLOUDINARY_CLOUD_NAME?.length || 0,
    apiKeyPresent: !!env.CLOUDINARY_API_KEY,
    apiKeyLength: env.CLOUDINARY_API_KEY?.length || 0,
    apiSecretPresent: !!env.CLOUDINARY_API_SECRET,
    apiSecretLength: env.CLOUDINARY_API_SECRET?.length || 0,
    cloudinaryUrlPresent: !!process.env.CLOUDINARY_URL,
    isConfigured: CloudinaryService.isConfigured(),
  };

  try {
    // Attempt a tiny ping or minimal upload to test actual connection
    // We will upload a 1x1 PNG pixel to see the exact error
    const pngBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
    
    await CloudinaryService.uploadBuffer(
      pngBuffer,
      `provia/diagnostic/test_${Date.now()}`,
      "image",
      "image/png"
    );
    
    return NextResponse.json({
      ...diagnostic,
      uploadTest: "SUCCESS",
    });
  } catch (error: any) {
    return NextResponse.json({
      ...diagnostic,
      uploadTest: "FAILED",
      errorName: error.name,
      errorMessage: error.message,
      errorStatus: error.statusCode || error.status,
      errorRaw: error.errors || error.rawError || String(error)
    });
  }
}
