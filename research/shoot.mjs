import { chromium } from "playwright";

// 10 references across buckets: trust/security, infra/dev, observability, fintech
const SITES = [
  { slug: "vanta", url: "https://www.vanta.com/" },
  { slug: "persona", url: "https://www.withpersona.com/" },
  { slug: "workos", url: "https://workos.com/" },
  { slug: "stripe", url: "https://stripe.com/" },
  { slug: "linear", url: "https://linear.app/" },
  { slug: "vercel", url: "https://vercel.com/" },
  { slug: "cloudflare", url: "https://www.cloudflare.com/" },
  { slug: "sentry", url: "https://sentry.io/welcome/" },
  { slug: "mercury", url: "https://mercury.com/" },
  { slug: "ramp", url: "https://ramp.com/" },
];

const VIEWPORT = { width: 1440, height: 900 };
const OUT = new URL("./shots/", import.meta.url).pathname;

async function shoot(page, site) {
  const errors = [];
  try {
    await page.goto(site.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    // give lazy content / fonts / animations time; try networkidle but don't fail hard
    try {
      await page.waitForLoadState("networkidle", { timeout: 15000 });
    } catch (e) {
      errors.push("networkidle timeout");
    }
    await page.waitForTimeout(3500);
    // dismiss common cookie banners
    for (const sel of [
      'button:has-text("Accept")',
      'button:has-text("Accept all")',
      'button:has-text("Allow all")',
      'button:has-text("Got it")',
      '#onetrust-accept-btn-handler',
    ]) {
      try {
        const el = await page.$(sel);
        if (el) { await el.click({ timeout: 2000 }); await page.waitForTimeout(800); break; }
      } catch {}
    }
    // hero (above the fold)
    await page.screenshot({ path: `${OUT}${site.slug}-hero.png` });
    // full page
    await page.screenshot({ path: `${OUT}${site.slug}.png`, fullPage: true });
    console.log(`OK   ${site.slug}${errors.length ? " (" + errors.join(",") + ")" : ""}`);
  } catch (e) {
    console.log(`FAIL ${site.slug}: ${e.message}`);
  }
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
});
const page = await ctx.newPage();
for (const site of SITES) {
  await shoot(page, site);
}
await browser.close();
console.log("DONE");
