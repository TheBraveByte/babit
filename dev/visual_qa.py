#!/usr/bin/env python3
"""
Visual QA pass — screenshots every section of the babit landing page
and auth pages in both light and dark mode, at desktop viewport.

Output: dev/qa-shots/{light,dark}/*.png
"""
import os
import time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5173"
OUT = os.path.join(os.path.dirname(__file__), "qa-shots")

# Sections to capture — (id, label). We scroll to each section and screenshot
# a viewport-sized region centered on it.
SECTIONS = [
    ("top", "00-hero"),
    ("#how", "01-how-it-works"),
    ("#who", "02-who-its-for"),
    ("#surfaces", "03-surfaces"),
    ("#product", "04-logs-vs-evidence"),
    ("authority", "05-authority-chain"),
    ("receipt", "06-receipt-centerpiece"),
    ("#security", "07-verify-record"),
    ("#developers", "08-engineers"),
    ("offline", "09-offline-evidence"),
    ("cta", "10-final-cta"),
    ("footer", "11-footer"),
]

AUTH_PAGES = [
    ("/login", "auth-login"),
    ("/signup", "auth-signup"),
    ("/forgot-password", "auth-forgot"),
]


def shot_landing(page, theme):
    """Scroll through the landing page, capturing each section."""
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(2000)  # let animations settle

    for anchor, label in SECTIONS:
        if anchor == "top":
            page.evaluate("window.scrollTo(0, 0)")
        elif anchor == "authority":
            # SectionAuthorityChain has no id — scroll to it by finding the
            # section after #product
            page.evaluate("""
                const sections = document.querySelectorAll('main section');
                const productIdx = [...sections].findIndex(s => s.id === 'product');
                if (productIdx >= 0 && sections[productIdx + 1]) {
                    sections[productIdx + 1].scrollIntoView({block: 'start'});
                }
            """)
        elif anchor == "receipt":
            page.evaluate("""
                const sections = document.querySelectorAll('main section');
                const productIdx = [...sections].findIndex(s => s.id === 'product');
                if (productIdx >= 0 && sections[productIdx + 2]) {
                    sections[productIdx + 2].scrollIntoView({block: 'start'});
                }
            """)
        elif anchor == "offline":
            page.evaluate("""
                const sections = document.querySelectorAll('main section');
                const devIdx = [...sections].findIndex(s => s.id === 'developers');
                if (devIdx >= 0 && sections[devIdx + 1]) {
                    sections[devIdx + 1].scrollIntoView({block: 'start'});
                }
            """)
        elif anchor == "cta":
            # FinalCTA is the last section before footer
            page.evaluate("""
                const sections = document.querySelectorAll('main section');
                if (sections.length > 0) {
                    sections[sections.length - 1].scrollIntoView({block: 'start'});
                }
            """)
        elif anchor == "footer":
            page.evaluate("document.querySelector('footer')?.scrollIntoView({block: 'start'})")
        else:
            page.evaluate(f"document.querySelector('{anchor}')?.scrollIntoView({{block: 'start'}})")

        page.wait_for_timeout(800)
        path = os.path.join(OUT, theme, f"{label}.png")
        page.screenshot(path=path, full_page=False)
        print(f"  {theme}/{label}.png")

    # Also capture a full-page screenshot
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(500)
    path = os.path.join(OUT, theme, "full-page.png")
    page.screenshot(path=path, full_page=True)
    print(f"  {theme}/full-page.png")


def shot_auth(page, theme):
    """Capture each auth page."""
    for path, label in AUTH_PAGES:
        page.goto(f"{BASE}{path}", wait_until="networkidle")
        page.wait_for_timeout(1500)
        out = os.path.join(OUT, theme, f"{label}.png")
        page.screenshot(path=out, full_page=False)
        print(f"  {theme}/{label}.png")


def set_theme(page, theme):
    """Set light or dark theme."""
    if theme == "dark":
        page.evaluate("document.documentElement.classList.add('dark')")
    else:
        page.evaluate("document.documentElement.classList.remove('dark')")
    page.wait_for_timeout(500)


def main():
    os.makedirs(os.path.join(OUT, "light"), exist_ok=True)
    os.makedirs(os.path.join(OUT, "dark"), exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,
        )
        page = context.new_page()

        for theme in ["light", "dark"]:
            print(f"\n=== {theme.upper()} ===")
            set_theme(page, theme)
            shot_landing(page, theme)
            shot_auth(page, theme)

        browser.close()
    print(f"\nDone — screenshots in {OUT}/")


if __name__ == "__main__":
    main()
