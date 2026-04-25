const os = require('os');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    res.json({
        cpu: {
            model: cpus[0]?.model || 'Vercel Serverless',
            cores: cpus.length,
            speed: cpus[0]?.speed || 0
        },
        memory: {
            total: totalMem,
            free: freeMem,
            used: totalMem - freeMem,
            usagePercent: Math.round(((totalMem - freeMem) / totalMem) * 100)
        },
        os: {
            platform: os.platform(),
            release: os.release(),
            uptime: os.uptime()
        },
        node: process.version,
        environment: 'Vercel Serverless'
    });
};
