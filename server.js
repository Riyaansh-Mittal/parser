const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AnonymizeUAPlugin = require('puppeteer-extra-plugin-anonymize-ua');
const randomUseragent = require('random-useragent');
const Mercury = require("./dist/mercury");
const express = require("express");
const app = express();

// Add stealth plugin and anonymize UA plugin
puppeteer.use(StealthPlugin());
puppeteer.use(AnonymizeUAPlugin());

app.use(express.json());

app.get("/parse", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  let browser;
  try {
    // Configure browser with more stealth options
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-blink-features=AutomationControlled'
      ],
      headless: true,
      ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();

    // Set random user agent
    const userAgent = randomUseragent.getRandom();
    await page.setUserAgent(userAgent);

    // Set extra headers to mimic browser
    await page.setExtraHTTPHeaders({
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9',
      'upgrade-insecure-requests': '1'
    });

    // Enable JavaScript and CSS to make it look more natural
    await page.setJavaScriptEnabled(true);
    await page.setBypassCSP(true);

    // Randomize viewport to prevent fingerprinting
    await page.setViewport({
      width: 1920 + Math.floor(Math.random() * 100),
      height: 1080 + Math.floor(Math.random() * 100),
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: false,
      isMobile: false,
    });

    // Add random delays between actions
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    // Navigate with randomized behavior
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
      referer: 'https://www.google.com/',
    });

    // Add artificial delay to mimic human reading
    await page.waitForTimeout(2000 + Math.random() * 3000);

    const html = await page.content();
    const result = await Mercury.parse(url, { content: html });
    return res.json(result);
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ 
      error: "Failed to parse", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
