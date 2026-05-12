import { useEffect, useRef, useState } from "react";
import bgImage from "@/assets/library-bg.png";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
  phase: number;
}

export function AnimatedLibraryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Parallax via mouse
  useEffect(() => {
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        setParallax({ x, y });
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COUNT = 45;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (initial = false): Particle => ({
      x: Math.random() * window.innerWidth,
      y: initial ? Math.random() * window.innerHeight : window.innerHeight + 10,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -(0.1 + Math.random() * 0.25),
      size: 1 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.4,
      hue: Math.random() < 0.6 ? 280 : 230, // purple / blue
      phase: Math.random() * Math.PI * 2,
    });

    particlesRef.current = Array.from({ length: COUNT }, () => spawn(true));

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particlesRef.current) {
        p.phase += dt * 0.001;
        p.x += p.vx + Math.sin(p.phase) * 0.05;
        p.y += p.vy;

        if (p.y < -10 || p.x < -10 || p.x > window.innerWidth + 10) {
          Object.assign(p, spawn(false));
        }

        const flicker = 0.85 + Math.sin(p.phase * 2) * 0.15;
        const alpha = p.opacity * flicker;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        grad.addColorStop(0, `hsla(${p.hue}, 90%, 75%, ${alpha})`);
        grad.addColorStop(1, `hsla(${p.hue}, 90%, 60%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#050010]">
      <div
        className="absolute inset-[-20px] bg-center bg-cover transition-transform duration-500 ease-out opacity-60"
        style={{
          backgroundImage: `url(${bgImage})`,
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0) scale(1.05)`,
          filter: "brightness(0.5) contrast(1.2)",
        }}
      />

      {/* Lighting overlay — candle + magic glow */}
      <div className="absolute inset-0 alb-lighting" />
      <div className="absolute inset-0 alb-lighting-2" />

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-80" />

      {/* Dark readability overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(10,0,30,0.2) 0%, rgba(5,0,20,0.5) 70%, rgba(2,0,12,0.8) 100%)",
        }}
      />
    </div>
  );
  }