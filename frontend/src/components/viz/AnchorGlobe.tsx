import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { vizPalette, prefersReducedMotion } from "./tokens";

/**
 * AnchorGlobe — a restrained rotating globe standing for babit's honest anchoring model:
 * each sealed root is published to a PUBLIC transparency log / public chain
 * (Anchor.KIND_TRANSPARENCY_LOG | PUBLIC_CHAIN), so a receipt is verifiable anywhere
 * without trusting babit. The globe depicts that public, distributed verification surface —
 * NOT customer traffic or scale. Markers are generic public-anchor nodes, not real cities,
 * and there are no traffic arcs. Honours prefers-reduced-motion (renders one static frame).
 */

// cobe wants RGB channels in 0..1. Parse #rgb / #rrggbb tokens; fall back to grey.
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return [0.5, 0.5, 0.5];
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// Generic public-anchor nodes — deliberately abstract, not a claim about where customers are.
const ANCHOR_MARKERS = [
  { location: [37.77, -122.41], size: 0.03 },
  { location: [51.5, -0.12], size: 0.03 },
  { location: [1.35, 103.82], size: 0.03 },
  { location: [-23.55, -46.63], size: 0.03 },
  { location: [35.68, 139.69], size: 0.03 },
] as const;

export function AnchorGlobe({ className = "", size = 480 }: { className?: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = prefersReducedMotion();
    let globe: { destroy: () => void } | null = null;
    let phi = 0;
    let width = size;

    const build = () => {
      const p = vizPalette();
      const isDark = document.documentElement.classList.contains("dark");
      const accent = hexToRgb(p.accent);
      const base = hexToRgb(p.fg);

      width = canvas.offsetWidth || size;

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.28,
        dark: isDark ? 1 : 0,
        diffuse: 1.1,
        mapSamples: 16000,
        mapBrightness: isDark ? 5.2 : 7.5,
        mapBaseBrightness: isDark ? 0.06 : 0.14,
        baseColor: base,
        markerColor: accent,
        glowColor: accent,
        opacity: 0.85,
        markers: ANCHOR_MARKERS.map((m) => ({ location: [...m.location] as [number, number], size: m.size })),
        onRender: (state: Record<string, number>) => {
          // Slow auto-rotation; a single static frame when reduced-motion is requested.
          if (!reduced) phi += 0.0025;
          state.phi = phi;
          state.width = width * 2;
          state.height = width * 2;
        },
      } as Parameters<typeof createGlobe>[1]);
    };

    build();

    const ro = new ResizeObserver(() => {
      width = canvas.offsetWidth || size;
    });
    ro.observe(canvas);

    // Re-create on theme change so token-derived colors follow light/dark.
    const mo = new MutationObserver(() => {
      globe?.destroy();
      phi = 0;
      build();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      ro.disconnect();
      mo.disconnect();
      globe?.destroy();
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: size, height: size, flexShrink: 0 }}
    />
  );
}
