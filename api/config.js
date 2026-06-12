module.exports = function handler(req, res) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
        return res.status(500).json({ error: 'Supabase not configured on server' });
    }

    res.status(200).json({ supabaseUrl: url, supabaseKey: key });
};
