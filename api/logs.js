// Di Vercel serverless, logs bersifat ephemeral per instance
// Selalu return array kosong karena tidak ada persistent state
module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'DELETE') {
        return res.json({ success: true });
    }

    res.json([]);
};
