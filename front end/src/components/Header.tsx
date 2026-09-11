import type { ReactNode } from "react";

type HeaderProps = {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  align?: "center" | "left";
  className?: string;
};

export function Header({
  kicker,
  title,
  description,
  actions,
  align = "center",
  className,
}: HeaderProps) {
  const centered = align === "center";
  return (
    <header className={`relative z-10 w-full ${className ?? ""}`}>
      <div
        className="mx-auto w-full max-w-3xl px-6 py-8 rounded-[28px] border"
        style={{
          background: "linear-gradient(180deg, rgba(26,0,51,0.55), rgba(16,0,43,0.45))",
          borderColor: "#9D4EDD33",
          backdropFilter: "blur(14px)",
          boxShadow:
            "0 25px 60px -20px #000000aa, inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div
          className={`flex flex-col gap-3 ${
            centered ? "items-center text-center" : "items-start text-left"
          }`}
        >
          {kicker && (
            <p
              className="font-display tracking-[0.4em] text-[11px]"
              style={{ color: "#E0AAFF" }}
            >
              {kicker}
            </p>
          )}
          <h1
            className="font-display text-4xl md:text-5xl font-bold leading-snug break-words max-w-full"
            style={{ color: "#E0AAFF" }}
          >
            {title}
          </h1>
          {description && (
            <p className="italic text-base md:text-lg" style={{ color: "#C77DFF" }}>
              {description}
            </p>
          )}
          {actions && <div className="flex items-center gap-3 mt-1">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
