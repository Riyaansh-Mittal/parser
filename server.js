const express = require("express");
const Mercury = require("./dist/mercury");
const app = express();

app.use(express.json());

app.get("/parse", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const result = await Mercury.parse(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36'
      }
    });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to parse", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mercury Parser running on http://localhost:${PORT}`);
});
