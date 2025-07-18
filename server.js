const express = require("express");
const Mercury = require("@postlight/mercury-parser");
const app = express();

app.use(express.json());

app.get("/parse", async (req, res) => {
  const url = req.query.url; // ✅ Add this line

  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const result = await Mercury.parse(url);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to parse", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mercury Parser running on http://localhost:${PORT}`);
});
