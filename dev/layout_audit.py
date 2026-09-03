#!/usr/bin/env python3
"""
Layout audit — extracts computed styles and layout metrics for every landing
section so we can analyze alignment, spacing, card borders, and typography
without viewing screenshots directly.
"""
import json
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5173"

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_timeout(2000)

        # Extract layout metrics for every section
        metrics = page.evaluate("""
() => {
  const sections = [...document.querySelectorAll('main section, main > div > section, footer')];
  return sections.map((s, i) => {
    const rect = s.getBoundingClientRect();
    const cs = getComputedStyle(s);
    const container = s.querySelector('.container-babit');
    let containerRect = null;
    let containerMaxWidth = null;
    if (container) {
      const cr = container.getBoundingClientRect();
      const ccs = getComputedStyle(container);
      containerRect = {x: Math.round(cr.x), width: Math.round(cr.width), left: Math.round(cr.left), right: Math.round(cr.right)};
      containerMaxWidth = ccs.maxWidth;
    }
    // Find the heading
    const h2 = s.querySelector('h2');
    const h3s = [...s.querySelectorAll('h3')];
    let headingInfo = null;
    if (h2) {
      const hcs = getComputedStyle(h2);
      const hr = h2.getBoundingClientRect();
      headingInfo = {
        text: h2.textContent.trim().slice(0, 60),
        fontSize: hcs.fontSize,
        fontWeight: hcs.fontWeight,
        letterSpacing: hcs.letterSpacing,
        x: Math.round(hr.x),
        width: Math.round(hr.width),
      };
    }
    // Find cards
    const cards = [...s.querySelectorAll('[class*="rounded-babit"]')];
    const cardInfo = cards.slice(0, 3).map(c => {
      const cs2 = getComputedStyle(c);
      const cr = c.getBoundingClientRect();
      return {
        borderRadius: cs2.borderRadius,
        border: cs2.border,
        backgroundColor: cs2.backgroundColor,
        boxShadow: cs2.boxShadow.slice(0, 80),
        width: Math.round(cr.width),
        x: Math.round(cr.x),
      };
    });
    return {
      index: i,
      id: s.id || '(none)',
      tag: s.tagName.toLowerCase(),
      rect: {x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height)},
      paddingTop: cs.paddingTop,
      paddingBottom: cs.paddingBottom,
      backgroundColor: cs.backgroundColor,
      borderTop: cs.borderTop,
      container: containerRect,
      containerMaxWidth,
      heading: headingInfo,
      h3Count: h3s.length,
      cards: cardInfo,
    };
  });
}
        """)

        print(json.dumps(metrics, indent=2))

        # Also check nav alignment
        nav = page.evaluate("""
() => {
  const nav = document.querySelector('header .container-babit');
  if (!nav) return null;
  const rect = nav.getBoundingClientRect();
  const cs = getComputedStyle(nav);
  return {x: Math.round(rect.x), width: Math.round(rect.width), maxWidth: cs.maxWidth, paddingInline: cs.paddingInline};
}
        """)
        print("\n=== NAV ===")
        print(json.dumps(nav, indent=2))

        # Check the hero container
        hero = page.evaluate("""
() => {
  const hero = document.querySelector('main section:first-child');
  if (!hero) return null;
  const container = hero.querySelector('.container-babit');
  if (!container) return null;
  const rect = container.getBoundingClientRect();
  const cs = getComputedStyle(container);
  return {x: Math.round(rect.x), width: Math.round(rect.width), maxWidth: cs.maxWidth, paddingInline: cs.paddingInline};
}
        """)
        print("\n=== HERO CONTAINER ===")
        print(json.dumps(hero, indent=2))

        # Check font being used
        font = page.evaluate("""
() => {
  const body = document.body;
  const cs = getComputedStyle(body);
  const html = document.documentElement;
  const hcs = getComputedStyle(html);
  return {
    bodyFont: cs.fontFamily,
    htmlFont: hcs.fontFamily,
    sampleH1: getComputedStyle(document.querySelector('h1')).fontFamily,
    sampleH2: getComputedStyle(document.querySelector('h2')).fontFamily,
  };
}
        """)
        print("\n=== FONTS ===")
        print(json.dumps(font, indent=2))

        # Check the globe visibility
        globe = page.evaluate("""
() => {
  const canvas = document.querySelector('canvas');
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const cs = getComputedStyle(canvas);
  return {width: rect.width, height: rect.height, opacity: cs.opacity, display: cs.display};
}
        """)
        print("\n=== GLOBE ===")
        print(json.dumps(globe, indent=2))

        browser.close()

if __name__ == "__main__":
    main()
