const OpenAI = require('openai');
const { toFile } = require('openai');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { audio, mimeType } = req.body || {};
    if (!audio) {
        return res.status(400).json({ error: 'No audio provided' });
    }

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
    }

    try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const buffer = Buffer.from(audio, 'base64');
        const ext = mimeType?.includes('ogg') ? 'ogg' : mimeType?.includes('mp4') ? 'mp4' : 'webm';
        const file = await toFile(buffer, `audio.${ext}`, { type: mimeType || 'audio/webm' });

        const transcription = await client.audio.transcriptions.create({
            model: 'gpt-4o-transcribe',
            file,
            language: 'no',
            prompt: 'Dette er en norsk handleliste lest opp på norsk. Vanlige ord: melk, brød, egg, smør, ost, kjøttdeig, kylling, laks, poteter, epler, bananer, tomater, agurk, paprika, løk, hvitløk, pasta, ris, mel, sukker, kaffe, te, juice, yoghurt, rømme, fløte, toalettpapir, tannkrem, såpe.',
        });

        return res.status(200).json({ text: transcription.text });
    } catch (err) {
        const status = err.status || 500;
        return res.status(status).json({ error: err.message || 'Transcription failed' });
    }
};
