import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./tokens";

/**
 * EvidencePipeline — a cinematic, full-bleed canvas showing the actual product
 * flow: agent actions enter from the left, pass through AUTHORIZATION, get
 * NOTARY-SEALED (with a flash), and append to the LEDGER on the right as
 * hash-linked blocks.
 *
 * Theme-aware: renders in light or dark mode by reading CSS variables.
 */
export function EvidencePipeline({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();

    // ── Theme detection ────────────────────────────────────────────
    const getTheme = () => document.documentElement.classList.contains("dark") ? "dark" : "light";
    let theme = getTheme();

    // Read CSS custom properties for theme-aware colors
    const refreshTheme = () => {
      theme = getTheme();
    };

    // ── Setup ──────────────────────────────────────────────────────
    let w = 0;
    let h = 0;
    let dpr = 1;

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

    // Watch for theme changes
    const mo = new MutationObserver(() => { refreshTheme(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // ── Color palettes ─────────────────────────────────────────────
    const colors = () => {
      if (theme === "dark") {
        return {
          bgInner: "#0a1413",
          bgMid: "#070b0a",
          bgOuter: "#050807",
          accent: "#2dd4bf",
          accentDim: "rgba(45, 212, 191, 0.4)",
          accentFaint: "rgba(45, 212, 191, 0.04)",
          lineFaint: "rgba(45, 212, 191, 0.12)",
          lineFlow: "rgba(45, 212, 191, 0.25)",
          nodeIdle: "rgba(45, 212, 191, 0.4)",
          label: "rgba(245, 246, 244, 0.7)",
          subLabel: "rgba(138, 144, 140, 0.6)",
          particleIdle: "rgba(148, 163, 184, 0.8)",
          particleTrail: "rgba(148, 163, 184, 0.4)",
          ledgerFill: "rgba(45, 212, 191, 0.08)",
          ledgerStroke: "rgba(45, 212, 191, 0.25)",
          ledgerText: "rgba(45, 212, 191, 0.6)",
          ledgerLink: "rgba(45, 212, 191, 0.15)",
        };
      }
      return {
        bgInner: "#f0fdfa",
        bgMid: "#f8fafc",
        bgOuter: "#ffffff",
        accent: "#0d9488",
        accentDim: "rgba(13, 148, 136, 0.5)",
        accentFaint: "rgba(13, 148, 136, 0.06)",
        lineFaint: "rgba(13, 148, 136, 0.15)",
        lineFlow: "rgba(13, 148, 136, 0.3)",
        nodeIdle: "rgba(13, 148, 136, 0.5)",
        label: "rgba(15, 23, 42, 0.7)",
        subLabel: "rgba(100, 116, 139, 0.7)",
        particleIdle: "rgba(100, 116, 139, 0.8)",
        particleTrail: "rgba(100, 116, 139, 0.4)",
        ledgerFill: "rgba(13, 148, 136, 0.06)",
        ledgerStroke: "rgba(13, 148, 136, 0.2)",
        ledgerText: "rgba(13, 148, 136, 0.7)",
        ledgerLink: "rgba(13, 148, 136, 0.12)",
      };
    };

    // ── Pipeline stages ────────────────────────────────────────────
    const STAGES = [
      { label: "ACTION", sub: "agent acts" },
      { label: "AUTHORIZE", sub: "human approves" },
      { label: "SEAL", sub: "notary signs" },
      { label: "LEDGER", sub: "append + anchor" },
    ];

    const stageX = (i: number) => w * (0.12 + (i / (STAGES.length - 1)) * 0.76);
    const stageY = () => h * 0.5;

    // ── Particles ──────────────────────────────────────────────────
    interface Particle {
      stage: number;
      x: number;
      y: number;
      speed: number;
      label: string;
      sealed: boolean;
    }

    const ACTIONS = [
      "approve.payout",
      "read.claim",
      "submit.report",
      "update.policy",
      "query.ledger",
      "sign.contract",
      "verify.identity",
      "export.audit",
    ];

    const particles: Particle[] = [];
    let spawnTimer = 0;

    const spawnParticle = (): Particle => ({
      stage: 0,
      x: stageX(0),
      y: stageY() + (Math.random() - 0.5) * 40,
      speed: 0.5 + Math.random() * 0.4,
      label: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
      sealed: false,
    });

    // ── Ledger blocks ──────────────────────────────────────────────
    interface LedgerBlock { hash: string; age: number; }
    const ledger: LedgerBlock[] = [];

    // ── Stage glow timers ──────────────────────────────────────────
    const stageGlow = [0, 0, 0, 0];

    const fakeHash = () => {
      const chars = "0123456789abcdef";
      let s = "";
      for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * 16)];
      return s;
    };

    // ── Draw functions ─────────────────────────────────────────────

    const drawBackground = () => {
      const c = colors();
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.7);
      grad.addColorStop(0, c.bgInner);
      grad.addColorStop(0.5, c.bgMid);
      grad.addColorStop(1, c.bgOuter);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle dot grid
      ctx.fillStyle = c.accentFaint;
      const spacing = 32;
      for (let x = 0; x < w; x += spacing) {
        for (let y = 0; y < h; y += spacing) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    };

    const drawPipeline = (t: number) => {
      const c = colors();
      const sy = stageY();

      // Connecting line
      ctx.strokeStyle = c.lineFaint;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(stageX(0), sy);
      ctx.lineTo(stageX(STAGES.length - 1), sy);
      ctx.stroke();

      // Flowing dashes
      ctx.strokeStyle = c.lineFlow;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 12]);
      ctx.lineDashOffset = -t * 0.03;
      ctx.beginPath();
      ctx.moveTo(stageX(0), sy);
      ctx.lineTo(stageX(STAGES.length - 1), sy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Stage nodes
      STAGES.forEach((stage, i) => {
        const x = stageX(i);
        const glow = stageGlow[i];

        // Glow ring
        if (glow > 0) {
          const glowGrad = ctx.createRadialGradient(x, sy, 0, x, sy, 60);
          if (theme === "dark") {
            glowGrad.addColorStop(0, `rgba(45, 212, 191, ${glow * 0.3})`);
            glowGrad.addColorStop(1, "rgba(45, 212, 191, 0)");
          } else {
            glowGrad.addColorStop(0, `rgba(13, 148, 136, ${glow * 0.2})`);
            glowGrad.addColorStop(1, "rgba(13, 148, 136, 0)");
          }
          ctx.fillStyle = glowGrad;
          ctx.fillRect(x - 60, sy - 60, 120, 120);
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(x, sy, 5, 0, Math.PI * 2);
        ctx.fillStyle = glow > 0 ? c.accent : c.nodeIdle;
        ctx.fill();

        // Node ring
        ctx.beginPath();
        ctx.arc(x, sy, 10, 0, Math.PI * 2);
        ctx.strokeStyle = theme === "dark"
          ? `rgba(45, 212, 191, ${0.15 + glow * 0.3})`
          : `rgba(13, 148, 136, ${0.2 + glow * 0.3})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = c.label;
        ctx.font = "600 10px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(stage.label, x, sy - 28);

        // Sub-label
        ctx.fillStyle = c.subLabel;
        ctx.font = "400 9px ui-monospace, monospace";
        ctx.fillText(stage.sub, x, sy + 38);
      });
    };

    const drawParticle = (p: Particle) => {
      const c = colors();
      const trailLen = 30;
      const grad = ctx.createLinearGradient(p.x - trailLen, p.y, p.x, p.y);
      grad.addColorStop(0, theme === "dark" ? "rgba(45, 212, 191, 0)" : "rgba(13, 148, 136, 0)");
      grad.addColorStop(1, p.sealed
        ? (theme === "dark" ? "rgba(45, 212, 191, 0.6)" : "rgba(13, 148, 136, 0.6)")
        : c.particleTrail);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x - trailLen, p.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      // Head dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sealed ? 3 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = p.sealed ? c.accent : c.particleIdle;
      ctx.fill();

      // Glow for sealed particles
      if (p.sealed) {
        const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 12);
        if (theme === "dark") {
          glowGrad.addColorStop(0, "rgba(45, 212, 191, 0.4)");
          glowGrad.addColorStop(1, "rgba(45, 212, 191, 0)");
        } else {
          glowGrad.addColorStop(0, "rgba(13, 148, 136, 0.3)");
          glowGrad.addColorStop(1, "rgba(13, 148, 136, 0)");
        }
        ctx.fillStyle = glowGrad;
        ctx.fillRect(p.x - 12, p.y - 12, 24, 24);
      }

      // Label
      ctx.fillStyle = c.particleTrail;
      ctx.font = "400 8px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(p.label, p.x, p.y - 12);
    };

    const drawLedger = () => {
      if (ledger.length === 0) return;

      const lx = stageX(STAGES.length - 1);
      const ly = stageY();

      ledger.forEach((block, i) => {
        const blockY = ly + 60 + i * 22;
        const opacity = Math.max(0, 1 - block.age / 8000);
        if (opacity <= 0) return;

        ctx.fillStyle = theme === "dark"
          ? `rgba(45, 212, 191, ${opacity * 0.08})`
          : `rgba(13, 148, 136, ${opacity * 0.06})`;
        ctx.strokeStyle = theme === "dark"
          ? `rgba(45, 212, 191, ${opacity * 0.25})`
          : `rgba(13, 148, 136, ${opacity * 0.2})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(lx - 60, blockY, 120, 18, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = theme === "dark"
          ? `rgba(45, 212, 191, ${opacity * 0.6})`
          : `rgba(13, 148, 136, ${opacity * 0.7})`;
        ctx.font = "400 8px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(`0x${block.hash}…`, lx, blockY + 12);

        if (i < ledger.length - 1) {
          ctx.strokeStyle = theme === "dark"
            ? `rgba(45, 212, 191, ${opacity * 0.15})`
            : `rgba(13, 148, 136, ${opacity * 0.12})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(lx, blockY + 18);
          ctx.lineTo(lx, blockY + 22);
          ctx.stroke();
        }
      });
    };

    // ── Animation loop ─────────────────────────────────────────────
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      drawBackground();

      // Spawn particles
      if (!reduced) {
        spawnTimer += dt;
        if (spawnTimer > 800) {
          spawnTimer = 0;
          if (particles.length < 6) particles.push(spawnParticle());
        }
      }

      // Update + draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const nextX = stageX(Math.min(p.stage + 1, STAGES.length - 1));

        p.x += p.speed * (dt / 16);

        if (p.x >= nextX) {
          p.stage = Math.min(p.stage + 1, STAGES.length - 1);
          stageGlow[p.stage] = 1;

          if (p.stage === 2 && !p.sealed) p.sealed = true;

          if (p.stage === 3) {
            ledger.unshift({ hash: fakeHash(), age: 0 });
            if (ledger.length > 5) ledger.pop();
            particles.splice(i, 1);
            continue;
          }
        }

        drawParticle(p);
      }

      // Decay stage glows
      for (let i = 0; i < stageGlow.length; i++) {
        stageGlow[i] = Math.max(0, stageGlow[i] - dt / 600);
      }

      // Age ledger blocks
      for (let i = ledger.length - 1; i >= 0; i--) {
        ledger[i].age += dt;
        if (ledger[i].age > 8000) ledger.splice(i, 1);
      }

      drawPipeline(now);
      drawLedger();

      rafRef.current = requestAnimationFrame(tick);
    };

    // Initial particles
    if (!reduced) {
      for (let i = 0; i < 3; i++) {
        const p = spawnParticle();
        p.x = stageX(0) + i * 80;
        p.stage = 0;
        particles.push(p);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
