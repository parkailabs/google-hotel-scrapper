const { chromium } = require('playwright');
const express = require('express');
const app = express();

app.get('/scrape', async (req, res) => {
  const city = req.query.city || 'Los Angeles';

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const searchUrl = `https://www.google.com/travel/search?q=hotels in ${city}`;
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const hotels = await page.evaluate(() => {
    const results = [];
    const cards = document.querySelectorAll('[role="listitem"]');
    cards.forEach(card => {
      const name = card.querySelector('div[jsname] span')?.innerText;
      const price = card.querySelector('span span span')?.innerText;
      const distance = card.querySelector('div[jsname] div:nth-child(2)')?.innerText;
      if (name && price) {
        results.push({ name, price, distance });
      }
    });
    return results.slice(0, 10);
  });

  await browser.close();
  res.json(hotels);
});

app.listen(3000, () => {
  console.log('✅ Scraper running on http://localhost:3000/scrape');
});
