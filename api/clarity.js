/**
 * Clarity Relay Diagnostic v1.1
 * Logs full details of the Clarity API response to help debug 500 errors.
 */

export default async function handler(req, res) {
  try {
    const projectId = process.env.CLARITY_PROJECT_ID;
    const token = process.env.CLARITY_API_TOKEN;

    if (!projectId || !token) {
      return res.status(500).json({
        step: "check-env",
        error: "Missing CLARITY_PROJECT_ID or CLARITY_API_TOKEN",
      });
    }

    // Build request to Clarity API
    const clarityUrl = `https://api.clarity.ms/export-data/api/v1/project-live-insights?projectId=${projectId}`;
    const payload = {
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      endDate: new Date().toISOString(),
      metrics: ["sessionId", "userId"],
      filters: [],
    };

    // Send to Clarity
    const response = await fetch(clarityUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    const summary = {
      httpStatus: response.status,
      isOk: response.ok,
      sample: text.slice(0, 300), // show first 300 chars for debug
    };

    if (!response.ok) {
      return res.status(response.status).json({
        step: "clarity-api",
        error: "Clarity API returned error",
        ...summary,
      });
    }

    const json = JSON.parse(text);
    return res.status(200).json({
      step: "clarity-api",
      success: true,
      count: json?.data?.length || 0,
      sample: summary.sample,
    });
  } catch (err) {
    return res.status(500).json({
      step: "relay-runtime",
      error: err.message,
      stack: err.stack,
    });
  }
}
