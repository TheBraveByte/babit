const { chromium } = require("playwright");

const BASE = "http://localhost:5176";
const EMAIL = "yusufakinleye144@gmail.com";
const PASSWORD = "babit-demo-1234";

(async () => {
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

  // Login
  console.log("Logging in...");
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(2000);

  // Fill login form
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Check we're logged in
  const url = page.url();
  console.log("After login URL:", url);

  const shots = [
    { path: "/dashboard", name: "dashboard-overview", wait: 3000 },
    { path: "/dashboard/analytics", name: "dashboard-analytics", wait: 3000 },
    { path: "/dashboard/activity", name: "dashboard-activity", wait: 3000 },
    { path: "/dashboard/delegations", name: "dashboard-delegations", wait: 4000 },
    { path: "/dashboard/sessions", name: "dashboard-sessions", wait: 3000 },
    { path: "/dashboard/receipts", name: "dashboard-receipts", wait: 3000 },
    { path: "/dashboard/verify", name: "dashboard-verify", wait: 3000 },
    { path: "/dashboard/agents", name: "dashboard-agents", wait: 3000 },
    { path: "/dashboard/projects", name: "dashboard-projects", wait: 3000 },
    { path: "/dashboard/apikeys", name: "dashboard-apikeys", wait: 3000 },
    { path: "/dashboard/settings", name: "dashboard-settings", wait: 3000 },
  ];

  const outDir = "dev/dashboard-shots";
  const fs = require("fs");
  fs.mkdirSync(outDir, { recursive: true });

  for (const s of shots) {
    console.log(`Capturing ${s.name}...`);
    await page.goto(`${BASE}${s.path}`);
    await page.waitForTimeout(s.wait);
    await page.screenshot({ path: `${outDir}/${s.name}.png`, fullPage: false });
    console.log(`  saved ${outDir}/${s.name}.png`);
  }

  // Also capture a receipt detail page
  console.log("Capturing receipt detail...");
  await page.goto(`${BASE}/dashboard/receipts`);
  await page.waitForTimeout(2000);
  // Click on the first receipt
  const firstRow = await page.$("table tbody tr, [data-receipt-id], a[href*='receipt']");
  if (firstRow) {
    await firstRow.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${outDir}/dashboard-receipt-detail.png`, fullPage: false });
    console.log(`  saved ${outDir}/dashboard-receipt-detail.png`);
  } else {
    console.log("  no receipt rows found");
  }

  console.log("\nErrors:", errors.length ? errors : "none");
  await browser.close();
})();
