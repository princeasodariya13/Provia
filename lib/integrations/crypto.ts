import * as crypto from "crypto";
import { env } from "../env";

// 32-byte key is required for aes-256-gcm
const getEncryptionKey = () => {
  let keyStr = env.INTEGRATION_TOKEN_ENCRYPTION_KEY;
  if (!keyStr) {
    keyStr = "default_integration_secret_key32";
  }
  // Hash the key using SHA-256 to guarantee exactly 32 bytes
  return crypto.createHash("sha256").update(keyStr).digest();
};

export function encryptToken(token: string): string {
  if (!token) return token;
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(token, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");
  return `${iv.toString("base64")}:${authTag}:${encrypted}`;
}

export function decryptToken(encryptedData: string): string {
  if (!encryptedData) return encryptedData;
  const parts = encryptedData.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted token format");
  
  const [ivBase64, authTagBase64, encryptedText] = parts;
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivBase64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagBase64, "base64"));
  
  let decrypted = decipher.update(encryptedText, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
