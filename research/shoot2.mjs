import { chromium } from "playwright";

// App / dashboard / docs / auth surfaces (not just landing heroes)
const SITES = [
  { slug: "linear-product", url: "https://linear.app/features" },
  { slug: "linear-method", url: "https://linear.app/method" },
  { slug: "linear-docs", url: "https://linear.app/docs" },
  { slug: "stripe-dashboard", url: "https://stripe.com/en-gb/payments" },
  { slug: "stripe-docs", url: "https://docs.stripe.com/api" },
  { slug: "vercel-home", url: "https://vercel.com/home" },
  { slug: "vercel-docs", url: "https://vercel.com/docs" },
  { slug: "sentry-product", url: "https://sentry.io/welcome/" },
  { slug: "sentry-errors", url: "https://sentry.io/for/error-monitoring/" },
  { slug: "datadog", url: "https://www.datadoghq.com/" },
  { slug: "datadog-product", url: "https://www.datadoghq.com/product/" },
  { slug: "workos-docs", url: "https://workos.com/docs" },
  { slug: "workos-admin", url: "https://workos.com/admin-portal" },
  { slug: "planetscale", url: "https://planetscale.com" },
  { slug: "neon", url: "https://neon.tech" },
  { slug: "resend", url: "https://resend.com" },
  { slug: "clerk", url: "https://clerk.com" },
  { slug: "retool", url: "https://retool.com" },
  { slug: "railway", url: "https://railway.com" },
];

const VIEWPORT = { width: 1440, height: 900 };
const OUT = new URL("./shots/", import.meta.url).pathname;

async function dismissConsent(page) {
  try {
    const clicked = await page.evaluate(() => {
      const rx = /accept|agree|got it|allow all/i;
      const btns = Array.from(document.querySelectorAll('button, [role="button"], a'));
      for (const b of btns) {
        const t = (b.textContent || "").trim();
        if (t && rx.test(t) && t.length < 40) { b.click(); return t; }
      }
      return null;
    });
    if (clicked) await page.waitForTimeout(800);
  } catch {}
}

async function slowScroll(page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), (height * i) / steps);
    await page.waitForTimeout(400);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);
}

async function shootOnce(page, site) {
  await page.goto(site.url, { waitUntil: "networkidle", timeout: 60000 });
  await dismissConsent(page);
  await page.waitForTimeout(3000);
  await slowScroll(page);
  await page.screenshot({ path: `${OUT}${site.slug}.png`, fullPage: true });
  await page.screenshot({ path: `${OUT}${site.slug}-hero.png` });
}

async function shoot(page, site) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await shootOnce(page, site);
      console.log(`OK   ${site.slug}${attempt > 1 ? " (retry)" : ""}`);
      return;
    } catch (e) {
      if (attempt === 2) {
        console.log(`FAIL ${site.slug}: ${e.message}`);
      } else {
        console.log(`retry ${site.slug}: ${e.message}`);
        try { await page.waitForTimeout(1500); } catch {}
      }
    }
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
