const { chromium } = require("playwright");

const BASE = "http://localhost:5173";
const EMAIL = process.env.BABIT_EMAIL || "yusufakinleye144@gmail.com";
const PASSWORD = process.env.BABIT_PASSWORD || "";

(async () => {
  if (!PASSWORD) {
    console.error("Set BABIT_PASSWORD env var");
    process.exit(1);
  }
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });

  console.log("Logging in...");
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(2000);

  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const url = page.url();
  console.log("After login URL:", url);

  const shots = [
    { path: "/dashboard", name: "overview", wait: 3000 },
    { path: "/dashboard/analytics", name: "analytics", wait: 3000 },
    { path: "/dashboard/activity", name: "activity", wait: 3000 },
    { path: "/dashboard/delegations", name: "delegations", wait: 4000 },
    { path: "/dashboard/sessions", name: "sessions", wait: 3000 },
    { path: "/dashboard/receipts", name: "receipts", wait: 3000 },
    { path: "/dashboard/verify", name: "verify", wait: 3000 },
    { path: "/dashboard/agents", name: "agents", wait: 3000 },
    { path: "/dashboard/projects", name: "projects", wait: 3000 },
    { path: "/dashboard/apikeys", name: "apikeys", wait: 3000 },
    { path: "/dashboard/settings", name: "settings", wait: 3000 },
  ];

  const outDir = "public/dashboard-shots";
  const fs = require("fs");
  fs.mkdirSync(outDir, { recursive: true });

  for (const s of shots) {
    console.log(`Capturing ${s.name}...`);
    await page.goto(`${BASE}${s.path}`);
    await page.waitForTimeout(s.wait);
    await page.screenshot({ path: `${outDir}/${s.name}.png`, fullPage: false });
    console.log(`  saved ${outDir}/${s.name}.png`);
  }

  console.log("\nErrors:", errors.length ? errors : "none");
  await browser.close();
})();
