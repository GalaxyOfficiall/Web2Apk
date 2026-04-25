/**
 * License Key Service - Vercel Edition
 *
 * Di Vercel, filesystem bersifat read-only (serverless).
 * Data license key disimpan di environment variable KEYS_JSON.
 *
 * PENTING: Karena Vercel serverless bersifat stateless, perubahan data
 * (login/logout/create key) TIDAK persisten antar request kecuali
 * menggunakan external storage. Untuk production, gunakan salah satu:
 *   - KV Store (Vercel KV / Upstash Redis)
 *   - Database (PlanetScale, Supabase, MongoDB Atlas)
 *
 * Untuk setup sederhana: data key dibaca dari env KEYS_JSON (read-only).
 * Session verification menggunakan JWT-style token (stateless).
 */

const crypto = require('crypto');

// Secret untuk sign token (set di Vercel env vars)
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'changeme-set-TOKEN_SECRET-in-vercel';

/**
 * Load keys dari environment variable KEYS_JSON
 * Format KEYS_JSON (JSON string):
 * {
 *   "username": {
 *     "key": "ABCD1234EFGH5678",
 *     "expiresAt": "2026-12-31T00:00:00.000Z",
 *     "telegramId": null
 *   }
 * }
 */
function loadKeys() {
    try {
        const raw = process.env.KEYS_JSON;
        if (!raw) return {};
        return JSON.parse(raw);
    } catch (e) {
        console.error('[LicenseService] Failed to parse KEYS_JSON:', e.message);
        return {};
    }
}

/**
 * Generate signed session token (stateless JWT-like)
 * Format: base64(username:deviceId:expiresAt):signature
 */
function signToken(username, deviceId, keyExpiresAt) {
    const payload = `${username}:${deviceId}:${keyExpiresAt}`;
    const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex').substring(0, 16);
    return Buffer.from(payload).toString('base64') + '.' + sig;
}

/**
 * Verify signed session token
 */
function verifyToken(token) {
    try {
        const [b64, sig] = token.split('.');
        if (!b64 || !sig) return null;
        const payload = Buffer.from(b64, 'base64').toString('utf8');
        const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex').substring(0, 16);
        if (sig !== expectedSig) return null;
        const [username, deviceId, keyExpiresAt] = payload.split(':');
        return { username, deviceId, keyExpiresAt };
    } catch {
        return null;
    }
}

class LicenseKeyService {
    constructor() {
        this.keys = loadKeys();
    }

    /**
     * Reload keys dari env (dipanggil tiap request karena serverless)
     */
    reload() {
        this.keys = loadKeys();
    }

    /**
     * Validate login dan return signed token
     */
    validateLogin(username, key, deviceId) {
        this.reload();
        const normalizedUsername = username.toLowerCase().trim();
        const userData = this.keys[normalizedUsername];

        if (!userData) {
            return { success: false, error: 'Username tidak ditemukan' };
        }

        if (userData.key !== key) {
            return { success: false, error: 'License key salah' };
        }

        const expiresAt = new Date(userData.expiresAt);
        if (expiresAt < new Date()) {
            return { success: false, error: 'License key sudah expired' };
        }

        // Generate stateless signed token
        const token = signToken(normalizedUsername, deviceId, userData.expiresAt);

        return {
            success: true,
            username: normalizedUsername,
            expiresAt: userData.expiresAt,
            token
        };
    }

    /**
     * Verify session token (stateless)
     */
    verifySession(token) {
        const data = verifyToken(token);
        if (!data) {
            return { valid: false, reason: 'Token tidak valid' };
        }

        const expiresAt = new Date(data.keyExpiresAt);
        if (expiresAt < new Date()) {
            return { valid: false, reason: 'License expired' };
        }

        return {
            valid: true,
            username: data.username,
            expiresAt: data.keyExpiresAt
        };
    }

    /**
     * List all keys (dari env, read-only)
     */
    listKeys() {
        this.reload();
        const now = new Date();
        return Object.entries(this.keys).map(([username, data]) => {
            const expiresAt = new Date(data.expiresAt);
            const isExpired = expiresAt < now;
            const daysLeft = Math.ceil((expiresAt - now) / (24 * 60 * 60 * 1000));
            return {
                username,
                expiresAt: data.expiresAt,
                isExpired,
                daysLeft: isExpired ? 0 : daysLeft,
                telegramId: data.telegramId || null
            };
        });
    }

    /**
     * Get stats
     */
    getStats() {
        this.reload();
        const now = new Date();
        const total = Object.keys(this.keys).length;
        const active = Object.values(this.keys).filter(k => new Date(k.expiresAt) > now).length;
        return { total, active };
    }
}

module.exports = new LicenseKeyService();
          
