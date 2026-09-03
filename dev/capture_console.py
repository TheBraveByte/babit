#!/usr/bin/env python3
"""
Capture real screenshots from the babit console + auth pages.
Properly interacts with tab-based pages to load real data.
"""
import os
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5173"
EMAIL = "yusufakinleye144@gmail.com"
PASSWORD = "babit-demo-1234"
OUT = os.path.join(os.path.dirname(__file__), "console-shots")

SESSION_ID = "BAL-538932"
GRANT_ID = "BAL-342070"


def main():
    os.makedirs(OUT, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,
        )
        page = context.new_page()

        # ── Auth pages (not logged in) ──────────────────────────────
        print("=== AUTH PAGES ===")
        for theme in ["light", "dark"]:
            page.goto(BASE, wait_until="networkidle")
            page.wait_for_timeout(1000)
            if theme == "dark":
                page.evaluate("document.documentElement.classList.add('dark')")
            else:
                page.evaluate("document.documentElement.classList.remove('dark')")
            page.wait_for_timeout(500)

            for route, label in [
                ("#/login", "auth-login"),
                ("#/signup", "auth-signup"),
                ("#/forgot-password", "auth-forgot"),
            ]:
                page.goto(f"{BASE}/{route}", wait_until="networkidle")
                page.wait_for_timeout(2000)
                path = os.path.join(OUT, f"{theme}-{label}.png")
                page.screenshot(path=path, full_page=False)
                print(f"  {theme}/{label}.png")

        # ── Login ───────────────────────────────────────────────────
        print("\n=== CONSOLE PAGES ===")
        page.goto(f"{BASE}/#/login", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.fill('input[type="email"]', EMAIL)
        page.fill('input[type="password"]', PASSWORD)
        page.click('button[type="submit"]')
        page.wait_for_function("window.location.hash.includes('dashboard')", timeout=30000)
        page.wait_for_timeout(3000)
        print(f"  Logged in — {page.url}")

        # Dashboard overview
        page.goto(f"{BASE}/#/dashboard", wait_until="networkidle")
        page.wait_for_timeout(3000)
        page.screenshot(path=os.path.join(OUT, "console-dashboard.png"), full_page=False)
        print("  console-dashboard.png")

        # Analytics — has charts
        page.goto(f"{BASE}/#/dashboard/analytics", wait_until="networkidle")
        page.wait_for_timeout(4000)
        page.screenshot(path=os.path.join(OUT, "console-analytics.png"), full_page=False)
        print("  console-analytics.png")

        # Sessions — fill session ID, click Fetch Anchor
        page.goto(f"{BASE}/#/dashboard/sessions", wait_until="networkidle")
        page.wait_for_timeout(2000)
        # Fill the session ID input (placeholder contains "BAL" or "session")
        session_input = page.query_selector('input[placeholder*="BAL"], input[placeholder*="session"], input[placeholder*="Session"]')
        if session_input:
            session_input.fill(SESSION_ID)
            print(f"  Filled session ID: {SESSION_ID}")
        # Click the Fetch Anchor button
        fetch_btn = None
        for btn in page.query_selector_all("button"):
            text = page.evaluate("(el) => el.textContent.trim()", btn)
            if "fetch" in text.lower():
                fetch_btn = btn
                break
        if fetch_btn:
            fetch_btn.click()
            print("  Clicked Fetch Anchor")
        page.wait_for_timeout(4000)
        page.screenshot(path=os.path.join(OUT, "console-sessions.png"), full_page=False)
        print("  console-sessions.png")

        # Delegations — click "Verify Chain" tab, fill grant ID, submit
        page.goto(f"{BASE}/#/dashboard/delegations", wait_until="networkidle")
        page.wait_for_timeout(2000)
        # Click the "Verify Chain" tab
        for btn in page.query_selector_all("button"):
            text = page.evaluate("(el) => el.textContent.trim()", btn)
            if text == "Verify Chain":
                btn.click()
                print("  Clicked Verify Chain tab")
                break
        page.wait_for_timeout(1000)
        # Fill the grant ID input
        grant_input = page.query_selector('input[placeholder*="BAL"]')
        if grant_input:
            grant_input.fill(GRANT_ID)
            print(f"  Filled grant ID: {GRANT_ID}")
        # Click the Verify submit button (inside the form)
        for btn in page.query_selector_all("button[type=\"submit\"]"):
            text = page.evaluate("(el) => el.textContent.trim()", btn)
            if "verify" in text.lower():
                btn.click()
                print(f"  Clicked: {text}")
                break
        page.wait_for_timeout(4000)
        page.screenshot(path=os.path.join(OUT, "console-delegations.png"), full_page=False)
        print("  console-delegations.png")

        # Settings
        page.goto(f"{BASE}/#/dashboard/settings", wait_until="networkidle")
        page.wait_for_timeout(3000)
        page.screenshot(path=os.path.join(OUT, "console-settings.png"), full_page=False)
        print("  console-settings.png")

        # Verify page — if it exists as a separate route
        page.goto(f"{BASE}/#/dashboard/verify", wait_until="networkidle")
        page.wait_for_timeout(2000)
        # Check if the page has content
        text = page.inner_text("main")[:200]
        if text.strip():
            page.screenshot(path=os.path.join(OUT, "console-verify.png"), full_page=False)
            print("  console-verify.png")

        browser.close()
    print(f"\nDone — screenshots in {OUT}/")


if __name__ == "__main__":
    main()
