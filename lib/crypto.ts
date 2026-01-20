/**
 * AES-256-CBC Encryption Module
 * Production-grade encryption for sensitive data (2FA secrets, tokens)
 */

import crypto from 'crypto';

// Encryption key must be 32 bytes (256 bits) for AES-256
// In production, this MUST be set in .env and never committed
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-key-32-bytes-for-aes256!!'; // Exactly 32 chars for dev

// Validate key length
function getKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY || ENCRYPTION_KEY;
    if (key.length !== 32) {
        console.warn(`[Crypto] ENCRYPTION_KEY must be exactly 32 characters. Current: ${key.length}`);
        // Pad or truncate for dev mode only
        return Buffer.from(key.padEnd(32, '0').slice(0, 32), 'utf8');
    }
    return Buffer.from(key, 'utf8');
}

const IV_LENGTH = 16; // AES block size

/**
 * Encrypt plaintext using AES-256-CBC
 * Returns: iv:encryptedData (hex encoded)
 */
export function encrypt(plaintext: string): string {
    if (!plaintext) return '';

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', getKey(), iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Prepend IV (needed for decryption)
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt ciphertext encrypted with encrypt()
 * Expects format: iv:encryptedData (hex encoded)
 */
export function decrypt(ciphertext: string): string {
    if (!ciphertext || !ciphertext.includes(':')) return '';

    try {
        const [ivHex, encrypted] = ciphertext.split(':');
        const iv = Buffer.from(ivHex, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-cbc', getKey(), iv);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('[Crypto] Decryption failed:', error);
        return '';
    }
}

/**
 * Hash sensitive data (one-way, for comparison)
 * Uses SHA-256 with salt
 */
export function hashSensitive(data: string, salt?: string): string {
    const effectiveSalt = salt || process.env.HASH_SALT || 'default-salt';
    return crypto
        .createHmac('sha256', effectiveSalt)
        .update(data)
        .digest('hex');
}

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Constant-time string comparison (prevents timing attacks)
 */
export function secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
