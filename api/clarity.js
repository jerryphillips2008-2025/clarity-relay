// api/clarity.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { projectId, token, visitors } = req.body || {};
    if (!projectId || !token || !Array.isArray(visitors)) {
      return res.status(400).json({ error: 'Invalid request payload' });
    }

    const clarityUrl = `https://api.clarity.ms/export-data/api/v1/project-live-insights?projectId=${projectId}`;
    const payload = {
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      endDate: new Date().toISOString(),
      metrics: ['sessionId', 'userId'],
      filters: [],
    };

    const response = await fetch(clarityUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    const results = [];

    if (data?.data?.length) {
      visitors.forEach(v => {
        const match = data.data.find(d => d.userId === v || d.visitorId === v);
        if (match) results.push(match.sessionId);
      });
    }

    res.status(200).json({ sessions: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
