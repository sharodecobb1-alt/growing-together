// Holds your secret keys server-side. Only your two signed-in Google accounts can use it.
const json = (code, obj) => ({ statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'POST only' });
  try {
    // 1. Verify the Firebase sign-in token and check the email allow-list.
    const token = (event.headers.authorization || event.headers.Authorization || '').replace(/^Bearer /, '');
    if (!token) return json(401, { error: 'Not signed in' });
    const who = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_WEB_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token })
    }).then(r => r.json());
    const email = ((who.users && who.users[0] && who.users[0].email) || '').toLowerCase();
    const allowed = (process.env.ALLOWED_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    if (!email || !allowed.includes(email)) return json(403, { error: 'This account isn’t allowed' });

    const body = JSON.parse(event.body || '{}');

    // 2. Live YouTube search (optional: needs YOUTUBE_API_KEY).
    if (body.yt) {
      if (!process.env.YOUTUBE_API_KEY) return json(200, { videos: [] });
      const u = new URL('https://www.googleapis.com/youtube/v3/search');
      u.search = new URLSearchParams({ part: 'snippet', type: 'video', maxResults: '3', safeSearch: 'moderate', q: String(body.yt).slice(0, 200), key: process.env.YOUTUBE_API_KEY });
      const d = await fetch(u).then(r => r.json());
      if (d.error) return json(200, { videos: [] });
      return json(200, { videos: (d.items || []).map(i => ({ id: i.id.videoId, title: i.snippet.title, channel: i.snippet.channelTitle })) });
    }

    // 3. Gemini text/JSON generation.
    if (!body.prompt) return json(400, { error: 'No prompt' });
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const g = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts: [{ text: String(body.prompt).slice(0, 6000) }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.9 } })
    }).then(r => r.json());
    if (g.error) return json(502, { error: 'Gemini: ' + g.error.message });
    const parts = (((g.candidates || [])[0] || {}).content || {}).parts;
    const text = ((parts && parts[0] && parts[0].text) || '').replace(/^```json\s*|```\s*$/g, '').trim();
    return json(200, { text });
  } catch (e) {
    return json(500, { error: String(e.message || e) });
  }
};
