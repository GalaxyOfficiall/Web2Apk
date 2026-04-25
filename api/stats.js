const licenseKeyService = require('../lib/licenseKeyService');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const stats = licenseKeyService.getStats();
    res.json({
        totalKeys: stats.total,
        activeKeys: stats.active,
        mode: 'vercel-web-only'
    });
};
