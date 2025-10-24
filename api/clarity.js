export default async function handler(req, res) {
  try {
    const projectId = process.env.CLARITY_PROJECT_ID;
    const token = process.env.CLARITY_API_TOKEN;

    if (!projectId || !token) {
      return res.status(500).json({ error: "Missing project ID or API token" });
    }

    const clarityUrl = `https://api.clarity.ms/export-data/api/v1/project-live-insights?projectId=${projectId}`;
    const payload = {
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      endDate: new Date().toISOString(),
      metrics: ["sessionId", "userId"],
      filters: []
    };

    const response = await fetch(clarityUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    if (!response.ok) {
      return res.status(response.status).json({ error: text });
    }

    const data = JSON.parse(text);
    res.status(200).json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
