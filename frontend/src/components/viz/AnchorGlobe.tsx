import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./tokens";

/**
 * AnchorGlobe — a rotating wireframe globe with glowing anchor points
 * representing the public anchoring network. Evidence is witnessed
 * across the globe, not just in one place.
 *
 * Theme-aware: adapts colors for light and dark mode.
 */
export function AnchorGlobe({ className = "" }: { className?: string }) {
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

    // Anchor points (lat, lon) — abstract representation of global anchoring
    const ANCHORS = [
      { lat: 40.7, lon: -74.0 },
      { lat: 51.5, lon: -0.1 },
      { lat: 35.7, lon: 139.7 },
      { lat: 1.3, lon: 103.8 },
      { lat: 52.5, lon: 13.4 },
      { lat: -33.9, lon: 151.2 },
      { lat: 37.8, lon: -122.4 },
      { lat: 19.1, lon: 72.9 },
      { lat: 55.8, lon: 37.6 },
      { lat: -23.5, lon: -46.6 },
      { lat: 30.0, lon: 31.2 },
      { lat: 49.3, lon: -123.1 },
    ];

    // Connection arcs between anchors
    const ARCS = [
      [0, 1],
      [1, 4],
      [4, 5],
      [0, 6],
      [6, 2],
      [2, 3],
      [3, 7],
      [7, 8],
      [1, 8],
      [0, 9],
      [3, 10],
      [6, 11],
    ];

    let rotation = 0;

    // Project lat/lon to 3D point on sphere
    const project = (lat: number, lon: number, r: number, cx: number, cy: number) => {
      const latR = (lat * Math.PI) / 180;
      const lonR = ((lon + rotation) * Math.PI) / 180;
      const x = r * Math.cos(latR) * Math.cos(lonR);
      const y = r * Math.sin(latR);
      const z = r * Math.cos(latR) * Math.sin(lonR);
      return { x: cx + x, y: cy - y, z, visible: z > -r * 0.3 };
    };

    const tick = () => {
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.38;

      const isDark = theme === "dark";
      const accent = isDark ? "45, 212, 191" : "13, 148, 136";

      // Clear with subtle background
      ctx.clearRect(0, 0, w, h);

      // Draw sphere background circle
      const sphereGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
      if (isDark) {
        sphereGrad.addColorStop(0, "rgba(10, 20, 19, 0.8)");
        sphereGrad.addColorStop(1, "rgba(5, 8, 7, 0.4)");
      } else {
        sphereGrad.addColorStop(0, "rgba(240, 253, 250, 0.6)");
        sphereGrad.addColorStop(1, "rgba(248, 250, 252, 0.3)");
      }
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Draw latitude lines
      ctx.strokeStyle = `rgba(${accent}, 0.08)`;
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        const points: { x: number; y: number; z: number }[] = [];
        for (let lon = 0; lon <= 360; lon += 4) {
          const p = project(lat, lon - 180, r, cx, cy);
          points.push(p);
        }
        for (let i = 0; i < points.length - 1; i++) {
          if (points[i].z > -r * 0.2 && points[i + 1].z > -r * 0.2) {
            if (i === 0) ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[i + 1].x, points[i + 1].y);
          }
        }
        ctx.stroke();
      }

      // Draw longitude lines
      for (let lon = 0; lon < 360; lon += 30) {
        ctx.beginPath();
        const points: { x: number; y: number; z: number }[] = [];
        for (let lat = -90; lat <= 90; lat += 4) {
          const p = project(lat, lon - 180, r, cx, cy);
          points.push(p);
        }
        for (let i = 0; i < points.length - 1; i++) {
          if (points[i].z > -r * 0.2 && points[i + 1].z > -r * 0.2) {
            if (i === 0) ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[i + 1].x, points[i + 1].y);
          }
        }
        ctx.stroke();
      }

      // Draw connection arcs
      ARCS.forEach(([from, to]) => {
        const p1 = project(ANCHORS[from].lat, ANCHORS[from].lon, r, cx, cy);
        const p2 = project(ANCHORS[to].lat, ANCHORS[to].lon, r, cx, cy);
        if (!p1.visible || !p2.visible) return;

        // Arc midpoint (raised above surface)
        const midLat = (ANCHORS[from].lat + ANCHORS[to].lat) / 2;
        const midLon = (ANCHORS[from].lon + ANCHORS[to].lon) / 2;
        const midR = r * 1.15;
        const mid = project(midLat, midLon, midR, cx, cy);

        ctx.strokeStyle = `rgba(${accent}, 0.2)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(mid.x, mid.y, p2.x, p2.y);
        ctx.stroke();
      });

      // Draw anchor points
      ANCHORS.forEach((a) => {
        const p = project(a.lat, a.lon, r, cx, cy);
        if (!p.visible) return;

        // Glow
        const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16);
        glowGrad.addColorStop(0, `rgba(${accent}, 0.4)`);
        glowGrad.addColorStop(1, `rgba(${accent}, 0)`);
        ctx.fillStyle = glowGrad;
        ctx.fillRect(p.x - 16, p.y - 16, 32, 32);

        // Dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent}, 0.9)`;
        ctx.fill();

        // Ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${accent}, 0.3)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Rotate
      if (!reduced) rotation += 0.15;

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
