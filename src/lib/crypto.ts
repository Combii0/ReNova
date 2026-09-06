/**
 * Server-side AES-256-GCM encryption helpers for PII fields.
 *
 * MUST ONLY be imported in server code (API routes, server actions).
 * Never import in client components or layout files.
 *
 * Requires SERVER_ENCRYPTION_KEY=<64 hex chars> in .env.local.
 */

import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const raw = process.env.SERVER_ENCRYPTION_KEY;
  if (!raw) throw new Error("SERVER_ENCRYPTION_KEY is not set");
  const hex = raw.startsWith("0x") ? raw.slice(2) : raw;
  if (hex.length !== 64) {
    throw new Error(
      `SERVER_ENCRYPTION_KEY must be 64 hex chars, got ${hex.length}`,
    );
  }
  return Buffer.from(hex, "hex");
}

/** Encrypt a string → "<iv_hex>:<tag_hex>:<ciphertext_hex>" */
export function encrypt(plainText: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  let body = cipher.update(plainText, "utf8", "hex");
  body += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${tag}:${body}`;
}

/** Decrypt "<iv_hex>:<tag_hex>:<ciphertext_hex>" → original string */
export function decrypt(cipherText: string): string {
  const key = getKey();
  const parts = cipherText.split(":");
  if (parts.length !== 3) throw new Error("Malformed encrypted value");
  const [ivHex, tagHex, body] = parts;
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  let plain = decipher.update(body, "hex", "utf8");
  plain += decipher.final("utf8");
  return plain;
}
