import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = process.env.ENCRYPTION_KEY!; // 32-byte hex key (64 hex chars)

function getKey(): Buffer {
  if (!KEY || KEY.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-char hex string (32 bytes)");
  }
  return Buffer.from(KEY, "hex");
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Format: iv(24 hex) + authTag(32 hex) + ciphertext(hex)
  return iv.toString("hex") + authTag.toString("hex") + encrypted.toString("hex");
}

export function decrypt(ciphertext: string): string {
  const key = getKey();
  const iv = Buffer.from(ciphertext.slice(0, 24), "hex");
  const authTag = Buffer.from(ciphertext.slice(24, 56), "hex");
  const encrypted = Buffer.from(ciphertext.slice(56), "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return (
    decipher.update(encrypted, undefined, "utf8") + decipher.final("utf8")
  );
}

/** Safe decrypt — returns null if ciphertext is null/empty or decryption fails */
export function safeDecrypt(ciphertext: string | null): string | null {
  if (!ciphertext) return null;
  try {
    return decrypt(ciphertext);
  } catch {
    return null;
  }
}
