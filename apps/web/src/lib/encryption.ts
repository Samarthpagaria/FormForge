import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Derives a 32-byte encryption key from the NEXTAUTH_SECRET (or fallback).
 */
function getKey() {
  const secret = process.env.NEXTAUTH_SECRET || "fallback_salt_formforge_2026";
  return crypto.scryptSync(secret, "salt", 32);
}

/**
 * Encrypts a string (e.g. an IP address) using AES-256-GCM.
 * Returns a hex string in the format: iv:tag:encryptedData
 */
export function encryptIp(ip: string): string {
  try {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(ip, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
  } catch (err) {
    console.error("Encryption failed:", err);
    return "encryption_failed";
  }
}

/**
 * Decrypts a previously encrypted string back into the original IP address.
 * Use this function only when the company needs to recover the real IP.
 */
export function decryptIp(encryptedText: string): string | null {
  try {
    if (!encryptedText || encryptedText === "encryption_failed") return null;

    const parts = encryptedText.split(":");
    if (parts.length !== 3) return null;

    const iv = Buffer.from(parts[0], "hex");
    const tag = Buffer.from(parts[1], "hex");
    const encryptedData = parts[2];
    
    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (err) {
    console.error("Decryption failed:", err);
    return null;
  }
}
