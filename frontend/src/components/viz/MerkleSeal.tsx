import { useEffect, useRef } from "react";
import { prefersReducedMotion, vizPalette } from "./tokens";

/**
 * MerkleSeal — depicts babit's real inclusion proof (Proof model):
 * leaf events (content_hash) hash pairwise up a Merkle tree to a single merkle_root,
 * which is anchored to a transparency log (Anchor). It then demonstrates tamper-evidence:
 * one leaf is mutated → the changed hash propagates up its merkle_path → the merkle_root
 * no longer matches the anchored root → verification fails → resets to the sealed state.
 * Ties to GET /v1/events/{id}:proof and POST /v1/proofs:verify.
 */

const HEX = "0123456789abcdef";
function shortHash(seed: number): string {
  let out = "";
  let x = (seed * 2654435761) >>> 0;
  for (let i = 0; i < 4; i++) {
    x = (x * 1664525 + 1013904223) >>> 0;
    out += HEX[(x >>> (i * 3)) & 15];
    out += HEX[(x >>> (i * 3 + 4)) & 15];
  }
  return out;
}

const LEAVES = 4;

// Cycle timeline (seconds). One leaf is tampered, the change climbs the merkle_path,
// the root fails, then the tree re-seals.
const T_SEAL = 1.8; // hold sealed/green
const T_STEP = 0.55; // per-level propagation of the mutated hash
const T_HOLD = 1.9; // hold the failed state
const T_RESET = 0.9; // ease back to sealed
const CYCLE = T_SEAL + T_STEP * 4 + T_HOLD + T_RESET;

type Pt = { x: number; y: number };

export function MerkleSeal({ className = "" }: { className?: string }) {
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
    let startTs = 0;
    const reduced = prefersReducedMotion();

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

    const NODE_W = 78;
    const NODE_H = 22;

    const draw = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = (ts - startTs) / 1000;
      const p = vizPalette();
      ctx.clearRect(0, 0, width, height);

      // --- Layout: leaves (left) → 2 parents → merkle_root → anchor (right) ---
      const padX = 54;
      const padY = 26;
      const colLeaf = padX;
      const colMid = width * 0.42;
      const colRoot = width * 0.66;
      const colAnchor = width - padX - NODE_W;
      const innerH = height - padY * 2;

      const leaves: Pt[] = [];
      for (let i = 0; i < LEAVES; i++) {
        leaves.push({ x: colLeaf, y: padY + (innerH * (i + 0.5)) / LEAVES - NODE_H / 2 });
      }
      const mids: Pt[] = [];
      for (let i = 0; i < LEAVES / 2; i++) {
        const a = leaves[i * 2];
        const b = leaves[i * 2 + 1];
        mids.push({ x: colMid, y: (a.y + b.y) / 2 });
      }
      const root: Pt = { x: colRoot, y: (mids[0].y + mids[1].y) / 2 };
      const anchor: Pt = { x: colAnchor, y: root.y };

      // --- Tamper state machine ---
      // depth: 0 none · 1 leaf · 2 parent · 3 root · 4 anchor(fail)
      const cyclePhase = reduced ? 0 : t % CYCLE;
      const tamperLeaf = reduced ? -1 : Math.floor(t / CYCLE) % LEAVES;
      const tamperParent = tamperLeaf >= 0 ? Math.floor(tamperLeaf / 2) : -1;

      let breach = 0; // how many levels the mutation has reached
      let resetMix = 0; // 0 = fully breached color, 1 = resealed
      if (!reduced) {
        const afterSeal = cyclePhase - T_SEAL;
        if (afterSeal <= 0) {
          breach = 0;
        } else if (afterSeal < T_STEP * 4) {
          breach = Math.min(4, 1 + Math.floor(afterSeal / T_STEP));
        } else if (afterSeal < T_STEP * 4 + T_HOLD) {
          breach = 4;
        } else {
          breach = 4;
          resetMix = Math.min(1, (afterSeal - T_STEP * 4 - T_HOLD) / T_RESET);
        }
      }

      const good = p.verified;
      const bad = p.failed;
      const failColor = (depth: number, onPath: boolean): string => {
        if (!onPath || breach < depth) return good;
        return mix(bad, good, resetMix);
      };

      // --- Edges (draw behind nodes) ---
      const edge = (from: Pt, to: Pt, active: boolean, live: boolean) => {
        const x1 = from.x + NODE_W;
        const y1 = from.y + NODE_H / 2;
        const x2 = to.x;
        const y2 = to.y + NODE_H / 2;
        const mx = (x1 + x2) / 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(mx, y1, mx, y2, x2, y2);
        ctx.strokeStyle = active ? mix(bad, p.border, resetMix) : p.border;
        ctx.lineWidth = active ? 1.8 : 1.2;
        ctx.stroke();
        // A travelling accent dot marks the mutated hash climbing the merkle_path.
        if (live) {
          const afterSeal = cyclePhase - T_SEAL;
          const frac = Math.max(0, Math.min(1, (afterSeal % T_STEP) / T_STEP));
          const bx = bez(x1, mx, mx, x2, frac);
          const by = bez(y1, y1, y2, y2, frac);
          ctx.beginPath();
          ctx.arc(bx, by, 2.6, 0, Math.PI * 2);
          ctx.fillStyle = p.accent;
          ctx.fill();
        }
      };

      for (let i = 0; i < LEAVES; i++) {
        const parent = Math.floor(i / 2);
        const onPath = i === tamperLeaf;
        const live = !reduced && onPath && breach === 1;
        edge(leaves[i], mids[parent], onPath && breach >= 1, live);
      }
      for (let i = 0; i < mids.length; i++) {
        const onPath = i === tamperParent;
        const live = !reduced && onPath && breach === 2;
        edge(mids[i], root, onPath && breach >= 2, live);
      }
      {
        const onPath = tamperLeaf >= 0;
        const live = !reduced && onPath && breach === 3;
        edge(root, anchor, onPath && breach >= 3, live);
      }

      // --- Nodes ---
      ctx.textBaseline = "middle";
      ctx.font = "9px ui-monospace, 'Geist Mono Variable', monospace";

      const node = (pt: Pt, seed: number, tampered: boolean, color: string, emphasize = false) => {
        roundRect(ctx, pt.x, pt.y, NODE_W, NODE_H, 6);
        ctx.fillStyle = p.surface;
        ctx.fill();
        ctx.lineWidth = emphasize ? 1.6 : 1.2;
        ctx.strokeStyle = color;
        ctx.stroke();
        // Status dot
        ctx.beginPath();
        ctx.arc(pt.x + 9, pt.y + NODE_H / 2, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        // Short hash (mutated seed when tampered)
        ctx.fillStyle = tampered ? mix(bad, p.muted, resetMix) : p.muted;
        ctx.fillText(
          shortHash(tampered ? seed ^ 0x9e3779b9 : seed),
          pt.x + 18,
          pt.y + NODE_H / 2 + 0.5,
        );
      };

      for (let i = 0; i < LEAVES; i++) {
        const onPath = i === tamperLeaf;
        const tampered = onPath && breach >= 1 && resetMix < 1;
        node(leaves[i], 11 + i, tampered, failColor(1, onPath));
      }
      for (let i = 0; i < mids.length; i++) {
        const onPath = i === tamperParent;
        const tampered = onPath && breach >= 2 && resetMix < 1;
        node(mids[i], 71 + i, tampered, failColor(2, onPath));
      }
      const rootBad = tamperLeaf >= 0 && breach >= 3 && resetMix < 1;
      node(root, 907, rootBad, failColor(3, tamperLeaf >= 0), true);

      // Anchor node (transparency log) — verification passes/fails here.
      const anchorBad = tamperLeaf >= 0 && breach >= 4 && resetMix < 1;
      roundRect(ctx, anchor.x, anchor.y, NODE_W, NODE_H, 6);
      ctx.fillStyle = anchorBad ? mix(p.failed, p.surface, 0.86) : p.surface;
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = failColor(4, tamperLeaf >= 0);
      ctx.stroke();
      ctx.fillStyle = failColor(4, tamperLeaf >= 0);
      ctx.font = "9px ui-monospace, 'Geist Mono Variable', monospace";
      ctx.fillText(anchorBad ? "mismatch" : "anchored", anchor.x + 10, anchor.y + NODE_H / 2 + 0.5);

      // --- Tiny labels ---
      ctx.font = "8px ui-monospace, 'Geist Mono Variable', monospace";
      ctx.fillStyle = p.muted;
      ctx.globalAlpha = 0.7;
      ctx.textBaseline = "alphabetic";
      ctx.fillText("content_hash", colLeaf, padY - 8);
      ctx.fillText("merkle_root", colRoot, root.y - 8);
      ctx.textBaseline = "middle";
      ctx.globalAlpha = 1;

      // Status caption (bottom-left) reflecting the proof outcome.
      const failing = tamperLeaf >= 0 && breach >= 3 && resetMix < 0.5;
      ctx.font = "9px ui-monospace, 'Geist Mono Variable', monospace";
      ctx.fillStyle = failing ? p.failed : p.verified;
      ctx.textBaseline = "alphabetic";
      ctx.fillText(
        failing ? "root mismatch · proof invalid" : "sealed · proof valid",
        colLeaf,
        height - 8,
      );

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    // Reduced-motion draws once; repaint after a resize clears the bitmap.
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

function bez(a: number, b: number, c: number, d: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * mt * a + 3 * mt * mt * t * b + 3 * mt * t * t * c + t * t * t * d;
}

function mix(from: string, to: string, amt: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  if (!a || !b) return from;
  const k = Math.max(0, Math.min(1, amt));
  const r = Math.round(a[0] + (b[0] - a[0]) * k);
  const g = Math.round(a[1] + (b[1] - a[1]) * k);
  const bl = Math.round(a[2] + (b[2] - a[2]) * k);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().replace("#", "");
  if (m.length === 6) {
    return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
  }
  if (m.length === 3) {
    return [parseInt(m[0] + m[0], 16), parseInt(m[1] + m[1], 16), parseInt(m[2] + m[2], 16)];
  }
  return null;
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
