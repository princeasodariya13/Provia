const { loadEnvConfig } = require('@next/env');
loadEnvConfig('./');

const { CloudinaryService } = require('./lib/cloudinary/service.ts');
const fs = require('fs');

async function testUpload() {
  try {
    const imageContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const buffer = Buffer.from(imageContent, 'base64');
    
    console.log("Configured:", CloudinaryService.isConfigured());
    
    const result = await CloudinaryService.uploadBuffer(buffer, "test_image", "image", "image/png");
    console.log("Upload result:", result);
  } catch (err) {
    console.error("Test upload failed:", err);
  }
}

testUpload();
