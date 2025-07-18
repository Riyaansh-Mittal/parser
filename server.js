const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const Mercury = require("./dist/mercury");
const express = require("express");
const app = express();

app.use(express.json());

app.get("/parse", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ],
      headless: 'new'
    });
    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
    await page.setExtraHTTPHeaders({
      'accept-language': 'en-US,en;q=0.9',
    });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
      delay: Math.floor(Math.random() * 2000) + 1000
    });

    const html = await page.content();
    await browser.close();

    const result = await Mercury.parse(url, { content: html });
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      error: "Failed to parse", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
