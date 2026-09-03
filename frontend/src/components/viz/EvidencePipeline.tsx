import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./tokens";

/**
 * EvidencePipeline — a calm, minimal canvas for the hero background.
 * Slow-moving particles drift across a subtle dot grid. No labels,
 * no stages, no ledger blocks. Just ambient motion that doesn't
 * compete with the headline.
 *
 * Theme-aware: adapts to light and dark mode.
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

    // ── Particles ──────────────────────────────────────────────────
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
    }

    const particles: Particle[] = [];
    const count = 24;

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: 1 + Math.random() * 1.5,
          alpha: 0.1 + Math.random() * 0.3,
        });
      }
    };
    initParticles();

    // ── Draw ────────────────────────────────────────────────────────
    const draw = () => {
      const isDark = theme === "dark";
      const accent = isDark ? "45, 212, 191" : "13, 148, 136";

      ctx.clearRect(0, 0, w, h);

      // Subtle dot grid
      ctx.fillStyle = `rgba(${accent}, 0.05)`;
      const spacing = 40;
      for (let x = 0; x < w; x += spacing) {
        for (let y = 0; y < h; y += spacing) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Particles
      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          // Wrap
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent}, ${p.alpha})`;
        ctx.fill();
      }
    };

    // ── Loop ────────────────────────────────────────────────────────
    const tick = () => {
      draw();
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
