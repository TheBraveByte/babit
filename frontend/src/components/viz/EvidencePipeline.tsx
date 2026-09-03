import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./tokens";

/**
 * EvidencePipeline — a living network of nodes and connections.
 * Nodes drift at different speeds and angles; nearby nodes are linked by
 * hairline edges. The result is a calm but visible lattice of motion.
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
    const getTheme = () => (document.documentElement.classList.contains("dark") ? "dark" : "light");
    let theme = getTheme();

    let w = 0,
      h = 0,
      dpr = 1;

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

    const mo = new MutationObserver(() => {
      theme = getTheme();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // ── Nodes ──────────────────────────────────────────────────────
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
    }

    const nodes: Node[] = [];
    const count = 42;
    const linkDist = 140;
    const linkDistSq = linkDist * linkDist;

    const initNodes = () => {
      nodes.length = 0;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.15 + Math.random() * 0.45;
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 1.5 + Math.random() * 2.5,
          alpha: 0.25 + Math.random() * 0.4,
        });
      }
    };
    initNodes();

    // ── Draw ────────────────────────────────────────────────────────
    const draw = () => {
      const isDark = theme === "dark";
      const accent = isDark ? "45, 212, 191" : "13, 148, 136";

      ctx.clearRect(0, 0, w, h);

      // Subtle dot grid
      ctx.fillStyle = `rgba(${accent}, 0.05)`;
      const spacing = 48;
      for (let x = 0; x < w; x += spacing) {
        for (let y = 0; y < h; y += spacing) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Connections
      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < linkDistSq) {
            const dist = Math.sqrt(distSq);
            const t = 1 - dist / linkDist;
            ctx.strokeStyle = `rgba(${accent}, ${(0.12 * t * (a.alpha + b.alpha)) / 2})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const p of nodes) {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          // Wrap
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10;
          if (p.y > h + 10) p.y = -10;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent}, ${p.alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent}, ${p.alpha * 0.25})`;
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
