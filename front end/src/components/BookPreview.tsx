import { useEffect, useState } from "react";
import { type Book, getImageUrl } from "@/lib/api";

type Props = {
  story: Book;
  onClose: () => void;
  onEdit: () => void;
  onRead: () => void;
};

export function BookPreview({ story, onClose, onEdit, onRead }: Props) {
  const [opening, setOpening] = useState(false);
  const hue = 280; // Stable theme hue
  const coverBackground = `linear-gradient(135deg, oklch(0.42 0.22 ${hue}) 0%, oklch(0.32 0.2 ${hue}) 60%, oklch(0.2 0.16 ${hue}) 100%)`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !opening) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, opening]);

  const handleEdit = () => {
    setOpening(true);
    window.setTimeout(() => onEdit(), 1100);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in"
      style={{
        background:
          "radial-gradient(ellipse at center, #240046ee, #10002Bf2 70%)",
        backdropFilter: "blur(6px)",
      }}
      onClick={() => !opening && onClose()}
    >
      <div
        className="relative"
        style={{ perspective: 2200 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* The book */}
        <div
          className="relative"
          style={{
            width: 320,
            height: 460,
            transformStyle: "preserve-3d",
            transition: "transform 1.1s cubic-bezier(.6,.05,.2,1)",
            transform: opening
              ? "rotateY(-12deg) translateX(-90px) scale(1.05)"
              : "rotateY(-18deg) rotateX(4deg)",
          }}
        >
          {/* Inner pages (visible when cover opens) */}
          <div
            className="absolute inset-0 rounded-[6px]"
            style={{
              background: "linear-gradient(90deg, #f6e7ff, #fff7ff 50%, #f6e7ff)",
              boxShadow: "inset 0 0 30px #C77DFF55",
              transform: "translateZ(-2px)",
            }}
          >
            <div className="h-full w-full p-8 flex flex-col items-center justify-center text-center" style={{ color: "#3C096C" }}>
              <p className="font-display tracking-[0.3em] text-[10px] opacity-70">PRIMEIRAS PÁGINAS</p>
              <h3 className="font-display text-2xl mt-4 mb-2">{story.title}</h3>
              <p className="italic text-sm opacity-70">Abrindo o manuscrito...</p>
            </div>
          </div>

          {/* Front cover (rotates open) */}
          <div
            className="absolute inset-0 rounded-[6px] origin-left"
            style={{
              background: coverBackground,
              boxShadow:
                "inset 6px 0 0 #00000040, inset -2px 0 8px #ffffff20, 0 30px 60px -15px #00000099",
              transformStyle: "preserve-3d",
              transition: "transform 1.1s cubic-bezier(.6,.05,.2,1)",
              transform: opening ? "rotateY(-160deg)" : "rotateY(0deg)",
              backfaceVisibility: "hidden",
            }}
          >
            {/* Cover decoration */}
            <div className="absolute inset-5 border border-[#E0AAFF99] rounded-sm flex flex-col items-center justify-center text-center px-6">
              <span className="font-display tracking-[0.4em] text-[10px]" style={{ color: "#E0AAFF" }}>MANUSCRITO</span>
              <div className="my-4 h-px w-16" style={{ background: "#E0AAFF" }} />
              <h2 className="font-display text-3xl md:text-4xl font-bold leading-snug drop-shadow-lg" style={{ color: "var(--gold)" }}>
                {story.title}
              </h2>
              {story.subtitle && (
                  <p className="text-xs italic mt-3 opacity-90" style={{ color: "#E0AAFF" }}>{story.subtitle}</p>
              )}
              <div className="my-6 h-px w-10" style={{ background: "#E0AAFF" }} />
              <span className="font-display tracking-[0.3em] text-[10px]" style={{ color: "#C77DFF" }}>
                THE DARK LIBRARY
              </span>
            </div>
            {/* spine highlight */}
            <div className="absolute left-0 top-0 bottom-0 w-2" style={{ background: "linear-gradient(180deg, #00000050, transparent, #00000050)" }} />
          </div>

          {/* Back of cover (visible mid-flip) */}
          <div
            className="absolute inset-0 rounded-[6px] origin-left"
            style={{
              background: "linear-gradient(135deg, #1a0033, #0a0017)",
              transition: "transform 1.1s cubic-bezier(.6,.05,.2,1)",
              transform: opening ? "rotateY(-160deg)" : "rotateY(0deg)",
              backfaceVisibility: "hidden",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="absolute inset-0 rounded-[6px]"
              style={{
                transform: "rotateY(180deg)",
                background: "linear-gradient(135deg, #2a0050, #16002e)",
                boxShadow: "inset 0 0 40px #00000099",
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div
          className="mt-8 flex items-center justify-center gap-3 transition-opacity duration-300"
          style={{ opacity: opening ? 0 : 1, pointerEvents: opening ? "none" : "auto" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-sm font-display tracking-wider border transition hover:bg-white/5"
            style={{ borderColor: "#C77DFF55", color: "#E0AAFF" }}
          >
            ← Voltar
          </button>
          <button
            onClick={handleEdit}
            className="px-5 py-2.5 rounded-full text-sm font-display tracking-wider transition hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #9D4EDD, #7B2CBF)",
              color: "#fff",
              boxShadow: "0 6px 20px -4px #9D4EDD80",
            }}
          >
            ✎ Editar
          </button>
          <button
            onClick={onRead}
            className="px-5 py-2.5 rounded-full text-sm font-display tracking-wider transition hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #E0AAFF, #C77DFF)",
              color: "#10002B",
              boxShadow: "0 6px 20px -4px #C77DFF80",
            }}
          >
            📖 Ler
          </button>
        </div>
      </div>
    </div>
  );
}
