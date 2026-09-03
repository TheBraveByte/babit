import { useEffect, useRef } from "react";
import { vizPalette, prefersReducedMotion } from "./tokens";

/**
 * EvidenceLedger — an ambient canvas that depicts babit's real append-only chain:
 * ActionEvents arrive in `sequence` order, each linked to the previous (prev_hash) and
 * sealed by the notary (notary_signature = the teal seal pulse). Not random particles —
 * a chain forming. Honours prefers-reduced-motion (renders a static sealed chain).
 */

const HEX = "0123456789abcdef";
// Deterministic pseudo-hash per index so we never call Math.random (stable, SSR-safe).
function shortHash(seed: number): string {
  let out = "";
  let x = (seed * 2654435761) >>> 0;
  for (let i = 0; i < 6; i++) {
    x = (x * 1664525 + 1013904223) >>> 0;
    out += HEX[(x >>> (i * 3)) & 15];
  }
  return out;
}

const SURFACES = ["browser", "sandbox", "desktop"];

export function EvidenceLedger({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = prefersReducedMotion();

    const NODE_GAP = 132; // px between events along the chain
    const speed = 26; // px/sec drift
    let offset = 0;
    let startTs = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const draw = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = (ts - startTs) / 1000;
      if (!reduced) offset = (t * speed) % NODE_GAP;

      const p = vizPalette();
      ctx.clearRect(0, 0, width, height);

      const y = height / 2;
      const count = Math.ceil(width / NODE_GAP) + 2;
      // Base index scrolls so hashes stay associated with their node as it drifts.
      const baseIndex = Math.floor((t * speed) / NODE_GAP);

      // Connecting spine (the hash chain) — draw first, behind nodes.
      ctx.strokeStyle = p.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      for (let i = 0; i < count; i++) {
        const x = i * NODE_GAP - offset;
        const idx = baseIndex + i;
        const nodeT = reduced ? 1 : Math.min(1, (t * speed - (idx * NODE_GAP - width)) / 60);
        // Seal pulse: strongest when the node is fresh (near right edge), fading left.
        const life = Math.max(0, Math.min(1, x / width));
        const sealing = !reduced && life > 0.82;

        // Link tick from previous node
        ctx.strokeStyle = p.border;
        ctx.lineWidth = 1;

        // Event node — a small rounded block carrying a short content_hash
        const w = 92;
        const h = 30;
        const nx = x - w / 2;
        const ny = y - h / 2;
        roundRect(ctx, nx, ny, w, h, 7);
        ctx.fillStyle = p.surface;
        ctx.globalAlpha = 0.9 * Math.min(1, Math.max(0.25, nodeT));
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
        ctx.strokeStyle = sealing ? p.accent : p.border;
        ctx.stroke();

        // Seal dot (notary signature) + pulse ring
        const sealX = nx + 12;
        const sealY = y;
        ctx.beginPath();
        ctx.arc(sealX, sealY, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.verified;
        ctx.fill();
        if (sealing) {
          const pulse = (Math.sin(t * 4) + 1) / 2;
          ctx.beginPath();
          ctx.arc(sealX, sealY, 5 + pulse * 5, 0, Math.PI * 2);
          ctx.strokeStyle = p.accent;
          ctx.globalAlpha = 0.5 * (1 - pulse);
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Short hash + sequence label
        ctx.fillStyle = p.muted;
        ctx.font = "10px ui-monospace, 'Geist Mono Variable', monospace";
        ctx.textBaseline = "middle";
        ctx.fillText(shortHash(idx), sealX + 10, sealY - 0.5);
        ctx.fillStyle = p.border;
        ctx.font = "8px ui-monospace, monospace";
        ctx.fillText(`#${idx}`, nx + 4, ny + h - 6);
        // Surface glyph label (browser/sandbox/desktop)
        ctx.fillStyle = p.muted;
        ctx.globalAlpha = 0.6;
        ctx.fillText(SURFACES[idx % SURFACES.length], nx + 24, ny + h - 6);
        ctx.globalAlpha = 1;
      }

      // Left/right edge fade is handled by a CSS mask on the parent (keeps canvas clean).
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    // In reduced-motion mode the rAF loop stops after one frame, but a resize
    // clears the bitmap — repaint the static frame so the canvas never goes blank.
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
