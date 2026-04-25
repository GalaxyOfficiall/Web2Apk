module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    res.status(503).json({
        success: false,
        error: 'Fitur build APK tidak tersedia di versi Web-Only (Vercel).'
    });
};
