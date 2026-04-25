module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    res.status(503).json({
        success: false,
        error: 'Fitur build APK tidak tersedia di versi Web-Only (Vercel). Gunakan versi full dengan VPS.'
    });
};
