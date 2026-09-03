import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./tokens";

/**
 * SealingStream — a canvas animation for the auth right panel.
 * Shows agent actions flowing in, getting cryptographically sealed
 * with a flash, and forming a chain of hash-linked blocks.
 *
 * Theme-aware, product-relevant, and visually engaging.
 */
export function SealingStream({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const getTheme = () => document.documentElement.classList.contains("dark") ? "dark" : "light";
    let theme = getTheme();

    let w = 0, h = 0, dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const mo = new MutationObserver(() => { theme = getTheme(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // ── Actions that flow in ────────────────────────────────────────
    const ACTIONS = [
      "approve.payout",
      "read.claim",
      "submit.report",
      "update.policy",
      "sign.contract",
      "verify.identity",
    ];

    interface Particle {
      x: number;
      y: number;
      vy: number;
      label: string;
      sealed: boolean;
      sealFlash: number;
      life: number;
    }

    interface HashBlock {
      y: number;
      hash: string;
      age: number;
    }

    const particles: Particle[] = [];
    const blocks: HashBlock[] = [];
    let spawnTimer = 0;

    const fakeHash = () => {
      const chars = "0123456789abcdef";
      let s = "";
      for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * 16)];
      return s;
    };

    // ── Draw functions ──────────────────────────────────────────────

    const drawBackground = () => {
      const isDark = theme === "dark";
      // Subtle radial gradient
      const grad = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, w * 0.6);
      if (isDark) {
        grad.addColorStop(0, "rgba(10, 20, 19, 0.4)");
        grad.addColorStop(1, "rgba(7, 11, 10, 0)");
      } else {
        grad.addColorStop(0, "rgba(240, 253, 250, 0.4)");
        grad.addColorStop(1, "rgba(245, 245, 243, 0)");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Dot grid
      const accent = isDark ? "45, 212, 191" : "13, 148, 136";
      ctx.fillStyle = `rgba(${accent}, 0.04)`;
      const spacing = 28;
      for (let x = 0; x < w; x += spacing) {
        for (let y = 0; y < h; y += spacing) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    };

    const drawSealLine = () => {
      const isDark = theme === "dark";
      const accent = isDark ? "45, 212, 191" : "13, 148, 136";
      const sealY = h * 0.45;

      // Seal line (horizontal)
      ctx.strokeStyle = `rgba(${accent}, 0.15)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(0, sealY);
      ctx.lineTo(w, sealY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Seal label
      ctx.fillStyle = `rgba(${accent}, 0.5)`;
      ctx.font = "600 9px ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillText("◇ SEAL", 12, sealY - 8);
    };

    const drawParticle = (p: Particle) => {
      const isDark = theme === "dark";
      const accent = isDark ? "45, 212, 191" : "13, 148, 136";
      const idle = isDark ? "148, 163, 184" : "100, 116, 139";
      const sealY = h * 0.45;

      // Seal flash
      if (p.sealFlash > 0) {
        const flashGrad = ctx.createRadialGradient(p.x, sealY, 0, p.x, sealY, 40);
        flashGrad.addColorStop(0, `rgba(${accent}, ${p.sealFlash * 0.4})`);
        flashGrad.addColorStop(1, `rgba(${accent}, 0)`);
        ctx.fillStyle = flashGrad;
        ctx.fillRect(p.x - 40, sealY - 40, 80, 80);
      }

      // Trail
      const trailLen = 25;
      const grad = ctx.createLinearGradient(p.x, p.y - trailLen, p.x, p.y);
      grad.addColorStop(0, `rgba(${p.sealed ? accent : idle}, 0)`);
      grad.addColorStop(1, `rgba(${p.sealed ? accent : idle}, 0.5)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - trailLen);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      // Dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sealed ? 3 : 2, 0, Math.PI * 2);
      ctx.fillStyle = p.sealed ? `rgba(${accent}, 0.9)` : `rgba(${idle}, 0.7)`;
      ctx.fill();

      // Glow for sealed
      if (p.sealed) {
        const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10);
        glowGrad.addColorStop(0, `rgba(${accent}, 0.3)`);
        glowGrad.addColorStop(1, `rgba(${accent}, 0)`);
        ctx.fillStyle = glowGrad;
        ctx.fillRect(p.x - 10, p.y - 10, 20, 20);
      }

      // Label
      ctx.fillStyle = `rgba(${idle}, 0.5)`;
      ctx.font = "400 8px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(p.label, p.x, p.y - 10);
    };

    const drawBlocks = () => {
      const isDark = theme === "dark";
      const accent = isDark ? "45, 212, 191" : "13, 148, 136";
      const sealY = h * 0.45;
      const blockX = w / 2;
      const blockW = Math.min(180, w * 0.7);

      // Chain label
      ctx.fillStyle = `rgba(${accent}, 0.5)`;
      ctx.font = "600 9px ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillText("◇ LEDGER", 12, sealY + 80);

      blocks.forEach((block, i) => {
        const blockY = sealY + 70 + i * 26;
        const opacity = Math.max(0, 1 - block.age / 6000);
        if (opacity <= 0) return;

        // Block background
        ctx.fillStyle = `rgba(${accent}, ${opacity * 0.08})`;
        ctx.strokeStyle = `rgba(${accent}, ${opacity * 0.25})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(blockX - blockW / 2, blockY, blockW, 20, 4);
        ctx.fill();
        ctx.stroke();

        // Hash text
        ctx.fillStyle = `rgba(${accent}, ${opacity * 0.7})`;
        ctx.font = "400 8px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(`0x${block.hash}…`, blockX, blockY + 13);

        // Chain link
        if (i < blocks.length - 1) {
          ctx.strokeStyle = `rgba(${accent}, ${opacity * 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(blockX, blockY + 20);
          ctx.lineTo(blockX, blockY + 26);
          ctx.stroke();
        }
      });
    };

    // ── Animation loop ──────────────────────────────────────────────
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const sealY = h * 0.45;

      drawBackground();
      drawSealLine();

      // Spawn particles
      if (!reduced) {
        spawnTimer += dt;
        if (spawnTimer > 1200 && particles.length < 4) {
          spawnTimer = 0;
          particles.push({
            x: 30 + Math.random() * (w - 60),
            y: 0,
            vy: 0.4 + Math.random() * 0.3,
            label: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
            sealed: false,
            sealFlash: 0,
            life: 1,
          });
        }
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y += p.vy * (dt / 16);

        // Cross seal line
        if (!p.sealed && p.y >= sealY) {
          p.sealed = true;
          p.sealFlash = 1;
        }

        // Decay flash
        if (p.sealFlash > 0) {
          p.sealFlash = Math.max(0, p.sealFlash - dt / 400);
        }

        // Reached bottom — add to ledger
        if (p.y > h - 20) {
          blocks.unshift({ y: 0, hash: fakeHash(), age: 0 });
          if (blocks.length > 4) blocks.pop();
          particles.splice(i, 1);
          continue;
        }

        drawParticle(p);
      }

      // Age blocks
      for (let i = blocks.length - 1; i >= 0; i--) {
        blocks[i].age += dt;
        if (blocks[i].age > 6000) blocks.splice(i, 1);
      }

      drawBlocks();

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
