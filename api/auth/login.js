const licenseKeyService = require('../../lib/licenseKeyService');

// Rate limiting (in-memory per serverless instance — resets on cold start)
const loginAttempts = new Map();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Rate limiting
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    let attempt = loginAttempts.get(ip);
    if (attempt && now > attempt.resetTime) {
        loginAttempts.delete(ip);
        attempt = null;
    }
    if (!attempt) {
        loginAttempts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else {
        attempt.count++;
        if (attempt.count > RATE_LIMIT_MAX) {
            const minutesLeft = Math.ceil((attempt.resetTime - now) / 60000);
            return res.status(429).json({
                success: false,
                error: `Terlalu banyak percobaan login. Coba lagi dalam ${minutesLeft} menit.`
            });
        }
    }

    const { username, licenseKey, deviceId } = req.body || {};

    if (!username || !licenseKey || !deviceId) {
        return res.status(400).json({
            success: false,
            error: 'Username, license key, dan device ID diperlukan'
        });
    }

    const result = licenseKeyService.validateLogin(username, licenseKey, deviceId);

    if (!result.success) {
        return res.status(401).json({ success: false, error: result.error });
    }

    res.json({
        success: true,
        token: result.token,
        username: result.username,
        expiresAt: result.expiresAt
    });
};
