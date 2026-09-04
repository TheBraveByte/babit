const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:5173";
const OUT = "public/social-shots";
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();

  for (const light of [true, false]) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`);
    await page.evaluate((isLight) => {
      const theme = isLight ? "light" : "dark";
      localStorage.setItem("babit-theme", theme);
      document.documentElement.classList.toggle("dark", !isLight);
    }, light);
    await page.reload();
    await page.waitForTimeout(3500);
    const name = light ? "landing-light" : "landing-dark";
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
    console.log(`saved ${OUT}/${name}.png`);
    await ctx.close();
  }

  // Dashboard overview for product proof
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', "yusufakinleye144@gmail.com");
  await page.fill('input[type="password"]', "babit-demo-1234");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  await page.goto(`${BASE}/dashboard`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/dashboard-overview.png`, fullPage: false });
  console.log(`saved ${OUT}/dashboard-overview.png`);
  await ctx.close();

  await browser.close();
})();
