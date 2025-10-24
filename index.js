import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/api/clarity", async (req, res) => {
  const { projectId, token, visitors } = req.body;
  try {
    const response = await fetch(`https://api.clarity.ms/export-data/api/v1/project-live-insights?projectId=${projectId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ visitors }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (_, res) => res.send("✅ Clarity Relay is live"));
app.listen(3000);
