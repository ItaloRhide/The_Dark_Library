import { useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import homepageBg from "@/assets/homepage-back.png";

export function HomeView() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Wallpaper */}
      <img
        src={homepageBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay escuro para legibilidade */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Partículas de poeira já rodam pelo root (AnimatedLibraryBackground) */}

      {/* Conteúdo centralizado */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {/* Título */}
        <h1
          className="font-display text-4xl md:text-6xl font-bold leading-tight tracking-wide"
          style={{ color: "#E0AAFF" }}
        >
          The Dark Library
        </h1>

        {/* Linha decorativa */}
        <div
          className="w-24 h-px my-6"
          style={{
            background: "linear-gradient(90deg, transparent, #9D4EDD, transparent)",
          }}
        />

        {/* Tagline */}
        <p
          className="font-serif italic text-lg md:text-xl leading-relaxed"
          style={{ color: "#C77DFF" }}
        >
          Uma biblioteca de histórias esperando para ser explorada.
        </p>

        {/* Botão de login */}
        <button
          onClick={() => navigate({ to: "/login" })}
          className="mt-10 inline-flex items-center gap-2 px-10 py-4 rounded-full font-display tracking-widest text-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_40px_-8px_#9D4EDDBB] active:scale-95"
          style={{
            background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
            color: "#10002B",
            boxShadow: "0 8px 30px -6px #9D4EDD80",
          }}
        >
          <Lock className="h-4 w-4" />
          Entrar
        </button>
      </div>
    </div>
  );
}
