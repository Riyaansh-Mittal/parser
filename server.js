const puppeteer = require("puppeteer");
const Mercury = require("@postlight/mercury-parser");
const express = require("express");
const app = express();

app.use(express.json());

app.get("/parse", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const html = await page.content();
    await browser.close();

    const result = await Mercury.parse(url, { content: html });
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to parse", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
