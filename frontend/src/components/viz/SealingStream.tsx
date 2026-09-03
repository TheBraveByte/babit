import { useEffect, useRef } from "react";
import { vizPalette, prefersReducedMotion } from "./tokens";

/**
 * SealingStream — a live canvas that depicts babit's core loop in real time:
 *
 *   agent action → content hash → notary signature → appended to chain
 *
 * Actions drift downward from the top. As each crosses the "seal line" (a
 * horizontal teal beam at the vertical midpoint), its hash is computed and
 * a notary-seal pulse fires. Below the beam, the action carries a verified
 * checkmark and descends into a growing chain of sealed hash blocks that
 * scrolls slowly along the bottom.
 *
 * The visualization is deterministic (no Math.random) and honours
 * prefers-reduced-motion (renders a static sealed frame).
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

// Realistic agent actions — these mirror the actual API action types and
// resources that babit records, not invented scenarios.
const ACTIONS = [
  { agent: "claims-agent",     action: "approve_payout",   resource: "claims/CLM-48102",  value: "$4,200" },
  { agent: "checkout-agent",   action: "browser.click",    resource: "bestbuy.com/cart",   value: "$349" },
  { agent: "support-agent",    action: "browser.type",     resource: "zendesk/ticket/8841", value: "—" },
  { agent: "data-agent",       action: "browser.navigate", resource: "internal-db/query",  value: "—" },
  { agent: "claims-agent",     action: "browser.submit",   resource: "claims/CLM-48102",  value: "$4,200" },
  { agent: "checkout-agent",   action: "browser.click",    resource: "bestbuy.com/checkout", value: "$349" },
  { agent: "audit-agent",      action: "browser.scroll",   resource: "reports/Q3-summary", value: "—" },
  { agent: "support-agent",    action: "browser.submit",   resource: "zendesk/ticket/8841", value: "—" },
];

const ACTION_INTERVAL = 2.4; // seconds between new actions
const DRIFT_SPEED = 38;      // px/sec downward
const CHAIN_BLOCK_W = 58;
const CHAIN_BLOCK_H = 26;
const CHAIN_SPEED = 16;      // px/sec leftward scroll

interface StreamAction {
  index: number;
  agent: string;
  action: string;
  resource: string;
  value: string;
  y: number;          // current vertical position (px from top)
  sealed: boolean;    // has crossed the seal line
  sealPulse: number;  // 0..1, decays after sealing
  hash: string;
  seq: number;        // sequence number in the chain
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
    let lastSpawn = 0;
    let seqCounter = 42;
    const reduced = prefersReducedMotion();
    const actions: StreamAction[] = [];
    const chainBlocks: { hash: string; seq: number; x: number }[] = [];
    let chainOffset = 0;

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
      const a = ACTIONS[Math.floor(t / ACTION_INTERVAL) % ACTIONS.length];
      seqCounter++;
      actions.push({
        index: actions.length,
        agent: a.agent,
        action: a.action,
        resource: a.resource,
        value: a.value,
        y: -20,
        sealed: false,
        sealPulse: 0,
        hash: shortHash(seqCounter),
        seq: seqCounter,
      });
    };

    // Pre-seed a few actions and chain blocks so the first frame isn't empty
    if (reduced) {
      for (let i = 0; i < 3; i++) {
        seqCounter++;
        actions.push({
          index: i,
          ...ACTIONS[i],
          agent: ACTIONS[i].agent,
          action: ACTIONS[i].action,
          resource: ACTIONS[i].resource,
          value: ACTIONS[i].value,
          y: 40 + i * 80,
          sealed: true,
          sealPulse: 0,
          hash: shortHash(seqCounter),
          seq: seqCounter,
        });
      }
    }
    for (let i = 0; i < 8; i++) {
      chainBlocks.push({
        hash: shortHash(42 + i),
        seq: 42 + i,
        x: width - i * (CHAIN_BLOCK_W + 8),
      });
    }

    const draw = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = (ts - startTs) / 1000;
      const p = vizPalette();
      const sealLineY = height * 0.48;

      ctx.clearRect(0, 0, width, height);

      // ── Background: subtle dot grid ──────────────────────────────
      ctx.fillStyle = p.muted;
      ctx.globalAlpha = 0.08;
      const dotGap = 28;
      for (let x = dotGap / 2; x < width; x += dotGap) {
        for (let y = dotGap / 2; y < height; y += dotGap) {
          ctx.beginPath();
          ctx.arc(x, y, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // ── Seal line: a horizontal teal beam ────────────────────────
      const beamGrad = ctx.createLinearGradient(0, sealLineY - 1, 0, sealLineY + 1);
      beamGrad.addColorStop(0, "transparent");
      beamGrad.addColorStop(0.5, p.accent);
      beamGrad.addColorStop(1, "transparent");
      ctx.fillStyle = beamGrad;
      ctx.globalAlpha = 0.25;
      ctx.fillRect(0, sealLineY - 1, width, 2);
      ctx.globalAlpha = 1;

      // Seal line glow
      const glowGrad = ctx.createLinearGradient(0, sealLineY - 40, 0, sealLineY + 40);
      glowGrad.addColorStop(0, "transparent");
      glowGrad.addColorStop(0.5, p.accent);
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.globalAlpha = 0.06;
      ctx.fillRect(0, sealLineY - 40, width, 80);
      ctx.globalAlpha = 1;

      // ── Spawn new actions ────────────────────────────────────────
      if (!reduced && t - lastSpawn > ACTION_INTERVAL) {
        spawnAction(t);
        lastSpawn = t;
      }

      // ── Update + draw actions ────────────────────────────────────
      for (let i = actions.length - 1; i >= 0; i--) {
        const a = actions[i];
        if (!reduced) {
          a.y += DRIFT_SPEED / 60; // approx per-frame at 60fps
        }

        // Check if crossing the seal line
        if (!a.sealed && a.y >= sealLineY) {
          a.sealed = true;
          a.sealPulse = 1;
          // Add to chain
          chainBlocks.push({
            hash: a.hash,
            seq: a.seq,
            x: width + CHAIN_BLOCK_W,
          });
        }

        // Decay seal pulse
        if (a.sealPulse > 0 && !reduced) {
          a.sealPulse = Math.max(0, a.sealPulse - 0.02);
        }

        // Remove if below the chain area
        const chainY = height - CHAIN_BLOCK_H - 24;
        if (a.y > chainY + 10) {
          actions.splice(i, 1);
          continue;
        }

        drawActionCard(ctx, a, p, sealLineY, width);
      }

      // ── Update + draw chain blocks ───────────────────────────────
      if (!reduced) {
        chainOffset += CHAIN_SPEED / 60;
        for (const b of chainBlocks) {
          b.x -= CHAIN_SPEED / 60;
        }
      }
      // Remove off-screen blocks
      for (let i = chainBlocks.length - 1; i >= 0; i--) {
        if (chainBlocks[i].x < -CHAIN_BLOCK_W) {
          chainBlocks.splice(i, 1);
        }
      }

      // Draw chain spine
      const chainY = height - CHAIN_BLOCK_H - 24;
      ctx.strokeStyle = p.border;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(0, chainY + CHAIN_BLOCK_H / 2);
      ctx.lineTo(width, chainY + CHAIN_BLOCK_H / 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw chain blocks
      for (const b of chainBlocks) {
        drawChainBlock(ctx, b, p, chainY);
      }

      // ── Labels ───────────────────────────────────────────────────
      ctx.font = "9px ui-monospace, 'Geist Mono Variable', monospace";
      ctx.fillStyle = p.muted;
      ctx.globalAlpha = 0.5;
      ctx.textBaseline = "alphabetic";
      ctx.fillText("agent actions", 12, 18);
      ctx.fillText("notary seal", 12, sealLineY - 6);
      ctx.fillText("evidence chain", 12, chainY - 6);
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
  _sealLineY: number,
  width: number,
) {
  const cardW = Math.min(220, width - 32);
  const cardH = 44;
  const x = (width - cardW) / 2;
  const y = a.y - cardH / 2;

  // Card background
  roundRect(ctx, x, y, cardW, cardH, 8);
  ctx.fillStyle = p.surface;
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Border — teal when sealing, normal otherwise
  ctx.lineWidth = 1;
  if (a.sealPulse > 0) {
    ctx.strokeStyle = p.accent;
    ctx.globalAlpha = a.sealPulse;
    ctx.lineWidth = 1.5;
  } else if (a.sealed) {
    ctx.strokeStyle = p.border;
  } else {
    ctx.strokeStyle = p.border;
  }
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Seal pulse ring
  if (a.sealPulse > 0.1) {
    ctx.beginPath();
    roundRect(ctx, x - 2, y - 2, cardW + 4, cardH + 4, 10);
    ctx.strokeStyle = p.accent;
    ctx.globalAlpha = a.sealPulse * 0.4;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Action name
  ctx.font = "11px ui-monospace, 'Geist Mono Variable', monospace";
  ctx.fillStyle = a.sealed ? p.fg : p.muted;
  ctx.textBaseline = "middle";
  ctx.fillText(a.action, x + 12, y + 14);

  // Agent + resource
  ctx.font = "9px ui-monospace, 'Geist Mono Variable', monospace";
  ctx.fillStyle = p.muted;
  ctx.globalAlpha = 0.7;
  ctx.fillText(`${a.agent} · ${a.resource}`, x + 12, y + 30);
  ctx.globalAlpha = 1;

  // Status indicator on the right
  if (a.sealed) {
    // Hash
    ctx.font = "9px ui-monospace, 'Geist Mono Variable', monospace";
    ctx.fillStyle = p.verified;
    ctx.textAlign = "right";
    ctx.fillText(`#${a.seq} ${a.hash}`, x + cardW - 12, y + 14);
    ctx.textAlign = "left";

    // Checkmark
    ctx.beginPath();
    ctx.arc(x + cardW - 14, y + 30, 3, 0, Math.PI * 2);
    ctx.fillStyle = p.verified;
    ctx.fill();
  } else {
    // Pending dot
    ctx.beginPath();
    ctx.arc(x + cardW - 14, y + cardH / 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = p.muted;
    ctx.globalAlpha = 0.4;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawChainBlock(
  ctx: CanvasRenderingContext2D,
  b: { hash: string; seq: number; x: number },
  p: { fg: string; muted: string; border: string; surface: string; accent: string; verified: string },
  chainY: number,
) {
  const w = CHAIN_BLOCK_W;
  const h = CHAIN_BLOCK_H;
  const x = b.x;
  const y = chainY;

  roundRect(ctx, x, y, w, h, 6);
  ctx.fillStyle = p.surface;
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.lineWidth = 1;
  ctx.strokeStyle = p.border;
  ctx.stroke();

  // Seal dot
  ctx.beginPath();
  ctx.arc(x + 9, y + h / 2, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = p.verified;
  ctx.fill();

  // Hash
  ctx.font = "8px ui-monospace, 'Geist Mono Variable', monospace";
  ctx.fillStyle = p.muted;
  ctx.textBaseline = "middle";
  ctx.fillText(b.hash.slice(0, 6), x + 16, y + h / 2 - 3);
  ctx.fillStyle = p.border;
  ctx.fillText(`#${b.seq}`, x + 16, y + h / 2 + 6);
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
