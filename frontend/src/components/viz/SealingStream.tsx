import { useEffect, useRef } from "react";
import { vizPalette, prefersReducedMotion } from "./tokens";

/**
 * SealingStream — a cinematic, calm canvas depicting babit's core loop:
 *
 *   agent action → content hash → notary signature → appended to chain
 *
 * Design principles (studied from Linear, Cloudflare, Stripe):
 * - Calm, infrastructural motion — slow drift, never twitchy
 * - The seal beam is a real visual moment — a horizontal light beam with glow
 * - Color transitions: muted gray (unsealed) → teal flash (sealing) → verified green (sealed)
 * - Connected chain blocks with visible hash links
 * - Deterministic, no Math.random — stable and SSR-safe
 * - Honours prefers-reduced-motion (renders a static sealed frame)
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

// Realistic agent actions mirroring actual API action types
const ACTIONS = [
  { agent: "claims-agent",    action: "approve_payout",  resource: "claims/CLM-48102",   value: "$4,200" },
  { agent: "checkout-agent",  action: "browser.click",   resource: "bestbuy.com/cart",    value: "$349" },
  { agent: "support-agent",   action: "browser.type",    resource: "zendesk/ticket/8841", value: "—" },
  { agent: "data-agent",      action: "browser.navigate",resource: "internal-db/query",   value: "—" },
  { agent: "claims-agent",    action: "browser.submit",  resource: "claims/CLM-48102",   value: "$4,200" },
  { agent: "checkout-agent",  action: "browser.click",   resource: "bestbuy.com/checkout",value: "$349" },
  { agent: "audit-agent",     action: "browser.scroll",  resource: "reports/Q3-summary",  value: "—" },
  { agent: "support-agent",   action: "browser.submit",  resource: "zendesk/ticket/8841", value: "—" },
];

const SPAWN_INTERVAL = 3.2;   // seconds between new actions — calm, not rushed
const DRIFT_SPEED = 32;       // px/sec downward — slow, deliberate
const CARD_W = 280;
const CARD_H = 56;
const CHAIN_BLOCK_W = 64;
const CHAIN_BLOCK_H = 28;
const CHAIN_SPEED = 14;       // px/sec leftward — very slow
const SEAL_BEAM_HEIGHT = 3;   // px — the beam itself

interface StreamAction {
  agent: string;
  action: string;
  resource: string;
  value: string;
  y: number;
  sealed: boolean;
  sealFlash: number;   // 0..1, decays after sealing — controls teal glow
  hash: string;
  seq: number;
}

interface ChainBlock {
  hash: string;
  seq: number;
  x: number;
}

export function SealingStream({ className = "" }: { className?: string }) {
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
    let lastSpawn = -SPAWN_INTERVAL; // spawn first action immediately
    let seqCounter = 42;
    const reduced = prefersReducedMotion();
    const actions: StreamAction[] = [];
    const chainBlocks: ChainBlock[] = [];

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

    const spawnAction = (t: number) => {
      const a = ACTIONS[Math.floor(t / SPAWN_INTERVAL) % ACTIONS.length];
      seqCounter++;
      actions.push({
        agent: a.agent,
        action: a.action,
        resource: a.resource,
        value: a.value,
        y: -CARD_H,
        sealed: false,
        sealFlash: 0,
        hash: shortHash(seqCounter),
        seq: seqCounter,
      });
    };

    // Pre-seed chain blocks so the first frame isn't empty
    for (let i = 0; i < 12; i++) {
      chainBlocks.push({
        hash: shortHash(42 + i),
        seq: 42 + i,
        x: width - i * (CHAIN_BLOCK_W + 6),
      });
    }

    // Pre-seed a few sealed actions for reduced-motion mode
    if (reduced) {
      const _sealLineY = height * 0.52;
      for (let i = 0; i < 3; i++) {
        seqCounter++;
        actions.push({
          ...ACTIONS[i],
          agent: ACTIONS[i].agent,
          action: ACTIONS[i].action,
          resource: ACTIONS[i].resource,
          value: ACTIONS[i].value,
          y: _sealLineY + 40 + i * 70,
          sealed: true,
          sealFlash: 0,
          hash: shortHash(seqCounter),
          seq: seqCounter,
        });
      }
    }

    const draw = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = (ts - startTs) / 1000;
      const p = vizPalette();
      const sealLineY = height * 0.52;
      const chainY = height - CHAIN_BLOCK_H - 32;

      ctx.clearRect(0, 0, width, height);

      // ── Background: very subtle dot grid ─────────────────────────
      ctx.fillStyle = p.muted;
      ctx.globalAlpha = 0.06;
      const dotGap = 32;
      for (let x = dotGap / 2; x < width; x += dotGap) {
        for (let y = dotGap / 2; y < height; y += dotGap) {
          ctx.beginPath();
          ctx.arc(x, y, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // ── Seal beam: a horizontal light beam with glow ─────────────
      // Wide glow halo
      const beamGlow = ctx.createLinearGradient(0, sealLineY - 60, 0, sealLineY + 60);
      beamGlow.addColorStop(0, "transparent");
      beamGlow.addColorStop(0.5, p.accent);
      beamGlow.addColorStop(1, "transparent");
      ctx.fillStyle = beamGlow;
      ctx.globalAlpha = 0.05;
      ctx.fillRect(0, sealLineY - 60, width, 120);
      ctx.globalAlpha = 1;

      // The beam itself — a bright line with gradient
      const beamGrad = ctx.createLinearGradient(0, 0, width, 0);
      beamGrad.addColorStop(0, "transparent");
      beamGrad.addColorStop(0.15, p.accent);
      beamGrad.addColorStop(0.85, p.accent);
      beamGrad.addColorStop(1, "transparent");
      ctx.fillStyle = beamGrad;
      ctx.globalAlpha = 0.35;
      ctx.fillRect(0, sealLineY - SEAL_BEAM_HEIGHT / 2, width, SEAL_BEAM_HEIGHT);
      ctx.globalAlpha = 1;

      // ── Spawn new actions ────────────────────────────────────────
      if (!reduced && t - lastSpawn > SPAWN_INTERVAL) {
        spawnAction(t);
        lastSpawn = t;
      }

      // ── Update + draw actions ────────────────────────────────────
      for (let i = actions.length - 1; i >= 0; i--) {
        const a = actions[i];
        if (!reduced) {
          a.y += DRIFT_SPEED / 60;
        }

        // Check if crossing the seal line
        if (!a.sealed && a.y >= sealLineY) {
          a.sealed = true;
          a.sealFlash = 1;
          // Add to chain
          chainBlocks.push({
            hash: a.hash,
            seq: a.seq,
            x: width + CHAIN_BLOCK_W,
          });
        }

        // Decay seal flash
        if (a.sealFlash > 0 && !reduced) {
          a.sealFlash = Math.max(0, a.sealFlash - 0.012);
        }

        // Remove if below the chain area
        if (a.y > chainY - 10) {
          actions.splice(i, 1);
          continue;
        }

        drawActionCard(ctx, a, p, width);
      }

      // ── Update + draw chain ──────────────────────────────────────
      if (!reduced) {
        for (const b of chainBlocks) {
          b.x -= CHAIN_SPEED / 60;
        }
      }
      for (let i = chainBlocks.length - 1; i >= 0; i--) {
        if (chainBlocks[i].x < -CHAIN_BLOCK_W) {
          chainBlocks.splice(i, 1);
        }
      }

      // Draw chain spine — a solid line connecting all blocks
      ctx.strokeStyle = p.border;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(0, chainY + CHAIN_BLOCK_H / 2);
      ctx.lineTo(width, chainY + CHAIN_BLOCK_H / 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw chain blocks with connecting links
      for (let i = 0; i < chainBlocks.length; i++) {
        const b = chainBlocks[i];
        const next = chainBlocks[i + 1];
        drawChainBlock(ctx, b, p, chainY);
        // Draw link to next block
        if (next && next.x > b.x + CHAIN_BLOCK_W) {
          ctx.strokeStyle = p.border;
          ctx.globalAlpha = 0.2;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(b.x + CHAIN_BLOCK_W, chainY + CHAIN_BLOCK_H / 2);
          ctx.lineTo(next.x, chainY + CHAIN_BLOCK_H / 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // ── Stage labels ─────────────────────────────────────────────
      ctx.font = "10px ui-monospace, 'Geist Mono Variable', monospace";
      ctx.fillStyle = p.muted;
      ctx.globalAlpha = 0.4;
      ctx.textBaseline = "alphabetic";
      ctx.fillText("agent actions", 16, 22);
      ctx.fillText("notary seal", 16, sealLineY - 10);
      ctx.fillText("evidence chain", 16, chainY - 10);
      ctx.globalAlpha = 1;

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(() => { resize(); if (reduced) draw(0); });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

function drawActionCard(
  ctx: CanvasRenderingContext2D,
  a: StreamAction,
  p: { fg: string; muted: string; border: string; surface: string; accent: string; verified: string },
  width: number,
) {
  const cardW = Math.min(CARD_W, width - 32);
  const cardH = CARD_H;
  const x = (width - cardW) / 2;
  const y = a.y - cardH / 2;

  // Card shadow when sealed (subtle depth)
  if (a.sealed) {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.globalAlpha = 0.4;
    roundRect(ctx, x, y + 2, cardW, cardH, 10);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Card background
  roundRect(ctx, x, y, cardW, cardH, 10);
  ctx.fillStyle = p.surface;
  ctx.globalAlpha = a.sealed ? 0.95 : 0.8;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Border — transitions from muted → teal flash → verified
  if (a.sealFlash > 0.1) {
    // Sealing: teal border with glow
    ctx.strokeStyle = p.accent;
    ctx.globalAlpha = a.sealFlash;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Outer glow ring
    ctx.beginPath();
    roundRect(ctx, x - 3, y - 3, cardW + 6, cardH + 6, 13);
    ctx.strokeStyle = p.accent;
    ctx.globalAlpha = a.sealFlash * 0.25;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (a.sealed) {
    // Sealed: subtle verified tint
    ctx.strokeStyle = p.border;
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    // Unsealed: muted
    ctx.strokeStyle = p.border;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Left accent bar — color indicates state
  const barColor = a.sealFlash > 0.1 ? p.accent : a.sealed ? p.verified : p.muted;
  ctx.fillStyle = barColor;
  ctx.globalAlpha = a.sealed ? 0.8 : 0.4;
  roundRect(ctx, x, y, 3, cardH, 1.5);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Action name (mono, prominent)
  ctx.font = "12px ui-monospace, 'Geist Mono Variable', monospace";
  ctx.fillStyle = a.sealed ? p.fg : p.muted;
  ctx.textBaseline = "middle";
  ctx.fillText(a.action, x + 14, y + 18);

  // Agent + resource (smaller, muted)
  ctx.font = "10px ui-monospace, 'Geist Mono Variable', monospace";
  ctx.fillStyle = p.muted;
  ctx.globalAlpha = 0.6;
  ctx.fillText(`${a.agent} · ${a.resource}`, x + 14, y + 36);
  ctx.globalAlpha = 1;

  // Right side: status
  if (a.sealed) {
    // Hash + seq
    ctx.font = "10px ui-monospace, 'Geist Mono Variable', monospace";
    ctx.fillStyle = p.verified;
    ctx.textAlign = "right";
    ctx.fillText(`#${a.seq}`, x + cardW - 14, y + 18);
    ctx.fillStyle = p.muted;
    ctx.globalAlpha = 0.7;
    ctx.fillText(a.hash.slice(0, 8), x + cardW - 14, y + 36);
    ctx.textAlign = "left";
    ctx.globalAlpha = 1;

    // Verified checkmark dot
    ctx.beginPath();
    ctx.arc(x + cardW - 14, y + cardH / 2 + 8, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = p.verified;
    ctx.fill();
  } else {
    // Pending indicator — a small pulsing dot
    ctx.beginPath();
    ctx.arc(x + cardW - 14, y + cardH / 2, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = p.muted;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawChainBlock(
  ctx: CanvasRenderingContext2D,
  b: ChainBlock,
  p: { fg: string; muted: string; border: string; surface: string; accent: string; verified: string },
  chainY: number,
) {
  const w = CHAIN_BLOCK_W;
  const h = CHAIN_BLOCK_H;
  const x = b.x;
  const y = chainY;

  // Block background
  roundRect(ctx, x, y, w, h, 6);
  ctx.fillStyle = p.surface;
  ctx.globalAlpha = 0.8;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Border
  ctx.lineWidth = 1;
  ctx.strokeStyle = p.border;
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Seal dot (verified green)
  ctx.beginPath();
  ctx.arc(x + 10, y + h / 2, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = p.verified;
  ctx.fill();

  // Hash (truncated)
  ctx.font = "8px ui-monospace, 'Geist Mono Variable', monospace";
  ctx.fillStyle = p.muted;
  ctx.textBaseline = "middle";
  ctx.fillText(b.hash.slice(0, 7), x + 18, y + h / 2 - 4);
  // Seq number
  ctx.fillStyle = p.border;
  ctx.fillText(`#${b.seq}`, x + 18, y + h / 2 + 6);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
