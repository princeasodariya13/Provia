import { CloudinaryService } from "./lib/cloudinary/service";
import * as fs from "fs";

async function testUpload() {
  console.log("Starting Cloudinary Independent Test");
  
  // Create a tiny valid PDF buffer
  // Standard minimum PDF signature: %PDF-1.4\n%EOF\n
  const pdfBuffer = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF", "utf-8");
  
  try {
    const result = await CloudinaryService.uploadBuffer(
      pdfBuffer,
      `provia/test/resume_diagnostic_${Date.now()}`,
      "auto",
      "application/pdf"
    );
    console.log("Upload Success:", result);
  } catch (error) {
    console.error("Upload Failed with exception:", error);
  }
}

testUpload();
