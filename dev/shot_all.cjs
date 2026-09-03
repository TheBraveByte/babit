const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:5175";
const OUT = "/tmp/babit_shots";
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const pages = [
    { name: "landing", path: "/" },
    { name: "login", path: "/login" },
    { name: "signup", path: "/signup" },
    { name: "forgot", path: "/forgot-password" },
    { name: "dashboard", path: "/dashboard" },
    { name: "activity", path: "/dashboard/activity" },
    { name: "sessions", path: "/dashboard/sessions" },
    { name: "delegations", path: "/dashboard/delegations" },
    { name: "receipts", path: "/dashboard/receipts" },
    { name: "projects", path: "/dashboard/projects" },
    { name: "analytics", path: "/dashboard/analytics" },
    { name: "agents", path: "/dashboard/agents" },
    { name: "settings", path: "/dashboard/settings" },
  ];

  for (const light of [true, false]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`);
    await page.evaluate((isLight) => {
      localStorage.setItem("babit_theme", isLight ? "light" : "dark");
      document.documentElement.classList.toggle("dark", !isLight);
    }, light);
    await page.reload();
    await page.waitForTimeout(500);

    for (const p of pages) {
      await page.goto(`${BASE}${p.path}`);
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${OUT}/${p.name}-${light ? "light" : "dark"}.png`, fullPage: true });
      console.log(`shot: ${p.name} ${light ? "light" : "dark"}`);
    }
    await ctx.close();
  }

  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mpage = await mctx.newPage();
  await mpage.goto(`${BASE}/`);
  await mpage.waitForTimeout(800);
  await mpage.screenshot({ path: `${OUT}/landing-mobile.png`, fullPage: true });
  await mctx.close();

  await browser.close();
  console.log("done");
})();
