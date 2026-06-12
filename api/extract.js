const OpenAI = require('openai');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { transcript } = req.body || {};
    if (!transcript?.trim()) {
        return res.status(400).json({ error: 'No transcript provided' });
    }

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OPENAI_API_KEY not configured on server' });
    }

    try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const message = await client.chat.completions.create({
            model: 'gpt-4.1-mini',
            max_tokens: 400,
            messages: [
                {
                    role: 'system',
                    content: 'Du er en handlelisteassistent. Trekk ut handlevarer fra norsk tale. Svar KUN med varene, én per linje. Ingen nummerering, ingen punkter, ingen forklaring. Forenkle til enkle vareord (f.eks. "to liter melk" → "Melk", "et par epler" → "Epler"). Stor forbokstav på hvert element. Hvis ingen varer er nevnt, svar med tom streng.',
                },
                { role: 'user', content: transcript },
            ],
        });

        const items = message.choices[0].message.content.trim().split('\n').filter(Boolean);
        return res.status(200).json({ items });
    } catch (err) {
        const status = err.status || 500;
        const message = err.message || 'Internal server error';
        return res.status(status).json({ error: message });
    }
};
