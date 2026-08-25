import { CloudinaryService } from "./lib/cloudinary/service";
import * as fs from "fs";

async function testUpload() {
  console.log("Starting Cloudinary Independent Test");
  
  // Create a tiny valid PDF buffer
  // Standard minimum PDF signature: %PDF-1.4\n%EOF\n
  const pngBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
  
  try {
    const result = await CloudinaryService.uploadBuffer(
      pngBuffer,
      `provia/test/resume_diagnostic_${Date.now()}`,
      "image",
      "image/png"
    );
    console.log("Upload Success:", result);
  } catch (error) {
    console.error("Upload Failed with exception:", error);
  }
}

testUpload();
