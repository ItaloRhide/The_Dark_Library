import type { Book } from "@/lib/api";

type Props = {
  story: Book;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRename: () => void;
};

export function BookSpine({ story, onOpen, onEdit, onDelete, onRename }: Props) {
  // Use a stable hash of the ID for the color/height if not provided
  const hue = 280; // Default purple or can be derived from ID
  const cover = `linear-gradient(135deg, oklch(0.42 0.12 ${hue}) 0%, oklch(0.32 0.1 ${hue}) 60%, oklch(0.25 0.08 ${hue}) 100%)`;
  const height = 200 + (story.title.length % 5) * 14;
  return (
    <div className="group relative flex flex-col items-center" style={{ perspective: 800 }}>
      <button
        onClick={onOpen}
        title={story.title}
        className="relative rounded-sm transition-all duration-500 ease-out hover:-translate-y-3 hover:rotate-[-2deg] focus:outline-none"
        style={{
          width: 52,
          height,
          background: cover,
          boxShadow:
            "inset 2px 0 0 oklch(1 0 0 / 0.15), inset -3px 0 8px oklch(0 0 0 / 0.4), 0 12px 18px -8px oklch(0.15 0.05 40 / 0.6)",
          borderRadius: "2px 4px 4px 2px",
        }}
      >
        {/* gold lines */}
        <span
          className="absolute left-0 right-0 h-[2px]"
          style={{ top: 22, background: "var(--gold)" }}
        />
        <span
          className="absolute left-0 right-0 h-[2px]"
          style={{ bottom: 22, background: "var(--gold)" }}
        />
        <span
          className="absolute inset-x-2 top-1/2 -translate-y-1/2 text-[10px] tracking-widest text-center font-display"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            color: "oklch(0.92 0.08 85)",
            textShadow: "0 1px 2px oklch(0 0 0 / 0.5)",
            maxHeight: height - 60,
            overflow: "hidden",
            margin: "0 auto",
          }}
        >
          {story.title}
        </span>
      </button>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -bottom-9 flex gap-1 text-[10px] bg-card/95 backdrop-blur px-2 py-1 rounded-md shadow-soft border border-border z-20">
        <button onClick={onEdit} className="px-1.5 py-0.5 rounded hover:bg-accent/50 transition">Escrever</button>
        <button onClick={onRename} className="px-1.5 py-0.5 rounded hover:bg-accent/50 transition">Renomear</button>
        <button onClick={onDelete} className="px-1.5 py-0.5 rounded hover:bg-destructive/20 text-destructive transition">×</button>
      </div>
    </div>
  );
}