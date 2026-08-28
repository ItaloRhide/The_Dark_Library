import { useEffect, useMemo, useState } from "react";
import { booksApi, getImageUrl, type Book, type Chapter } from "@/lib/api";
import { bookCover } from "./BookSpine";
import { Header } from "./Header";

type Props = {
  storyId: string;
  initialChapterId?: string;
  onBack: () => void;
  onEdit: () => void;
};

const CHARS_PER_PAGE = 1100;

type Page =
  | { kind: "cover" }
  | { kind: "back" }
  | { kind: "title" }
  | { kind: "toc" }
  | { kind: "chapter-start"; chapterId: string; title: string; index: number }
  | { kind: "text"; chapterId: string; text: string };

function paginateChapter(text: string | null | undefined): string[] {
  if (!text || !text.trim()) return ["(Capítulo em branco...)"];
  const pages: string[] = [];
  const paragraphs = text.split(/\n+/);
  let buf = "";
  for (const p of paragraphs) {
    if ((buf + "\n\n" + p).length > CHARS_PER_PAGE && buf) {
      pages.push(buf.trim());
      buf = p;
    } else {
      buf = buf ? buf + "\n\n" + p : p;
    }
  }
  if (buf) pages.push(buf.trim());
  return pages;
}

function buildPages(book: Book): Page[] {
  const pages: Page[] = [{ kind: "cover" }, { kind: "back" }, { kind: "title" }, { kind: "toc" }];
  const chapters = book.chapters || [];
  chapters.forEach((c, i) => {
    pages.push({
      kind: "chapter-start",
      chapterId: c.id,
      title: c.title,
      index: i + 1,
    });
    paginateChapter(c.content).forEach((t) =>
      pages.push({ kind: "text", chapterId: c.id, text: t })
    );
  });
  return pages;
}

export function ReaderView({ storyId, initialChapterId, onBack, onEdit }: Props) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await booksApi.get(storyId);
        setBook(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch book for reading", err);
        onBack();
      }
    };
    fetchBook();
  }, [storyId]);

  const pages = useMemo(() => (book ? buildPages(book) : []), [book]);
  const total = pages.length;

  const startIdx = useMemo(() => {
    if (!initialChapterId || pages.length === 0) return 0;
    const i = pages.findIndex(
      (p) => p.kind === "chapter-start" && p.chapterId === initialChapterId
    );
    if (i < 0) return 0;
    return i % 2 === 0 ? i : i - 1;
  }, [pages, initialChapterId]);

  const [spread, setSpread] = useState(0);
  const [flipping, setFlipping] = useState<"next" | "prev" | null>(null);

  useEffect(() => {
    if (startIdx !== 0) setSpread(startIdx);
  }, [startIdx]);

  const next = () => {
    if (spread + 2 >= total) return;
    setFlipping("next");
    setTimeout(() => {
      setSpread((s) => s + 2);
      setFlipping(null);
    }, 600);
  };
  const prev = () => {
    if (spread === 0) return;
    setFlipping("prev");
    setTimeout(() => {
      setSpread((s) => Math.max(0, s - 2));
      setFlipping(null);
    }, 600);
  };

  const jumpToChapter = (chapterId: string) => {
    const i = pages.findIndex(
      (p) => p.kind === "chapter-start" && p.chapterId === chapterId
    );
    if (i < 0) return;
    setSpread(i % 2 === 0 ? i : i - 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (loading || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#10002B] text-[#E0AAFF] font-display">
        Folheando as páginas...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8"
      style={{
        background:
          "radial-gradient(ellipse at top, #3C096C, #10002B 70%)",
      }}
    >
      <Header
        kicker="MODO LEITURA"
        title={book.title}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-full text-sm font-display tracking-wider border transition hover:bg-white/5"
              style={{ borderColor: "#C77DFF55", color: "#E0AAFF" }}
            >
              ← Biblioteca
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 rounded-full text-sm font-display tracking-wider transition hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #E0AAFF, #C77DFF)",
                color: "#10002B",
                boxShadow: "0 6px 20px -4px #C77DFF80",
              }}
            >
              ✎ Editar
            </button>
          </div>
        }
        className="mb-6"
      />

      <div
        className="relative w-full max-w-6xl rounded-lg flex flex-col md:flex-row md:aspect-[16/10] p-3 md:p-7"
        style={{
          background: "linear-gradient(90deg, #3C096C, #240046 50%, #3C096C)",
          boxShadow: "0 30px 80px -20px #00000099",
          perspective: "2000px",
        }}
      >
        <div className="hidden md:block absolute left-1/2 top-6 bottom-6 w-6 -translate-x-1/2 pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, #00000066, transparent)" }}
        />

        <PageFace page={pages[spread]} book={book} side="left" pageNumber={spread + 1} onJump={jumpToChapter} className="w-full aspect-[3/4] md:aspect-auto md:flex-1 md:h-auto" />

        <div className="hidden md:block relative md:flex-1" style={{ transformStyle: "preserve-3d" }}>
          <div
            className="absolute inset-0 origin-left transition-transform duration-700 ease-in-out"
            style={{
              transform: flipping === "next" ? "rotateY(-180deg)" : "rotateY(0deg)",
              transformStyle: "preserve-3d",
              zIndex: flipping ? 30 : 1,
            }}
          >
            <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
              <PageFace page={pages[spread + 1]} book={book} side="right" pageNumber={spread + 2} onJump={jumpToChapter} className="h-full" />
            </div>
            <div
              className="absolute inset-0"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
              }}
            >
              <PageFace page={pages[spread + 2]} book={book} side="left" pageNumber={spread + 3} onJump={jumpToChapter} className="h-full" />
            </div>
          </div>
        </div>

        <button onClick={prev} disabled={spread === 0} aria-label="Página anterior" className="absolute left-0 top-0 bottom-0 w-1/4 disabled:opacity-30 cursor-w-resize z-20" />
        <button onClick={next} disabled={spread + 2 >= total} aria-label="Próxima página" className="absolute right-0 top-0 bottom-0 w-1/4 disabled:opacity-30 cursor-e-resize z-20" />
      </div>

      <div className="mt-6 flex items-center gap-6 text-sm" style={{ color: "#E0AAFF" }}>
        <button onClick={prev} disabled={spread === 0} className="px-4 py-2 rounded border border-border/40 disabled:opacity-30 hover:bg-card/20 transition">‹ Anterior</button>
        <span className="font-display tracking-widest">
          {Math.min(spread + 1, total)}–{Math.min(spread + 2, total)} / {total}
        </span>
        <button onClick={next} disabled={spread + 2 >= total} className="px-4 py-2 rounded border border-border/40 disabled:opacity-30 hover:bg-card/20 transition">Próxima ›</button>
      </div>
    </div>
  );
}

function PageFace({
  page,
  book,
  side,
  pageNumber,
  onJump,
  className,
}: {
  page: Page | undefined;
  book: Book;
  side: "left" | "right";
  pageNumber: number;
  onJump: (chapterId: string) => void;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden relative ${
        page && (page.kind === "cover" || page.kind === "back") ? "" : "p-6 md:p-14"
      } ${className ?? ""}`}
      style={{
        background:
          page && (page.kind === "cover" || page.kind === "back")
            ? "transparent"
            : "var(--paper)",
        color: "var(--ink)",
        boxShadow:
          side === "left"
            ? "inset -12px 0 18px -10px #00000059"
            : "inset 12px 0 18px -10px #00000059",
        borderRadius: side === "left" ? "4px 0 0 4px" : "0 4px 4px 0",
        fontFamily: "var(--font-body)",
      }}
    >
      <div className="h-full overflow-hidden">
        {!page ? null : page.kind === "cover" ? (
          <CoverPage book={book} />
        ) : page.kind === "back" ? (
          <BackPage book={book} />
        ) : page.kind === "title" ? (
          <TitlePage book={book} />
        ) : page.kind === "toc" ? (
          <TocPage chapters={book.chapters || []} onJump={onJump} />
        ) : page.kind === "chapter-start" ? (
          <ChapterStart title={page.title} index={page.index} />
        ) : (
          <div className="h-full text-justify leading-8 whitespace-pre-wrap text-[15px] md:text-base" style={{ hyphens: "auto" }}>
            {page.text}
          </div>
        )}
      </div>
      <div
        className={`absolute bottom-4 left-0 right-0 text-center text-xs italic opacity-60 ${
          page && (page.kind === "cover" || page.kind === "back") ? "hidden" : ""
        }`}
      >
        {page ? pageNumber : ""}
      </div>
    </div>
  );
}

function CoverPage({ book }: { book: Book }) {
  const coverBackground = bookCover(book);
  return (
    <div className="h-full w-full relative" style={{ background: coverBackground }}>
      {book.cover_image ? (
        <img
          src={getImageUrl(book.cover_image)}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-5 border border-[#E0AAFF99] rounded-sm flex flex-col items-center justify-center text-center px-6">
          <span className="font-display tracking-[0.4em] text-[10px]" style={{ color: "#E0AAFF" }}>MANUSCRITO</span>
          <div className="my-4 h-px w-16" style={{ background: "#E0AAFF" }} />
          <h2 className="font-display text-3xl md:text-4xl font-bold leading-snug drop-shadow-lg" style={{ color: "var(--gold)" }}>
            {book.title}
          </h2>
          {book.subtitle && (
            <p className="text-xs italic mt-3 opacity-90" style={{ color: "#E0AAFF" }}>{book.subtitle}</p>
          )}
          <div className="my-6 h-px w-10" style={{ background: "#E0AAFF" }} />
          <span className="font-display tracking-[0.3em] text-[10px]" style={{ color: "#C77DFF" }}>
            THE DARK LIBRARY
          </span>
        </div>
      )}
    </div>
  );
}

function BackPage({ book }: { book: Book }) {
  return (
    <div
      className="h-full w-full relative"
      style={{ background: "linear-gradient(135deg, #1a0033, #0a0017)" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #2a0050, #16002e)",
          boxShadow: "inset 0 0 40px #00000099",
          borderRadius: "0 4px 4px 0",
        }}
      />
      <div className="absolute inset-6 border border-[#E0AAFF55] rounded-sm flex flex-col items-center justify-center text-center px-6" style={{ color: "#E0AAFF" }}>
        <span className="font-display tracking-[0.3em] text-[10px] opacity-70">THE DARK LIBRARY</span>
        <div className="my-4 h-px w-10" style={{ background: "#E0AAFF44" }} />
        <span className="italic text-sm opacity-60">{book.subtitle || "Manuscrito Original"}</span>
      </div>
    </div>
  );
}

function TitlePage({ book }: { book: Book }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <p className="font-display tracking-[0.4em] text-[10px] mb-6 opacity-60">UMA HISTÓRIA DE</p>
      <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">{book.title}</h1>
      <div className="my-6 h-px w-24" style={{ background: "#7B2CBF66" }} />
      <p className="italic text-lg opacity-80">{book.subtitle ? book.subtitle : "Manuscrito Original"}</p>
      <p className="mt-12 font-display tracking-[0.3em] text-[10px] opacity-50">THE DARK LIBRARY</p>
    </div>
  );
}

function TocPage({ chapters, onJump }: { chapters: Chapter[]; onJump: (id: string) => void }) {
  return (
    <div>
      <h2 className="font-display text-2xl mb-1">Sumário</h2>
      <div className="h-px w-full mb-6" style={{ background: "#7B2CBF44" }} />
      <ul className="space-y-2">
        {chapters.map((c, i) => (
          <li key={c.id} className="flex items-baseline gap-3">
            <span className="font-display text-sm opacity-60 w-6">{String(i + 1).padStart(2, "0")}</span>
            <button
              onClick={() => onJump(c.id)}
              className="text-left hover:underline"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {c.title || "Sem título"}
            </button>
            <span className="flex-1 mx-2 border-b border-dotted opacity-40" style={{ borderColor: "#7B2CBF" }} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChapterStart({ title, index }: { title: string; index: number }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <p className="font-display tracking-[0.5em] text-xs opacity-60">CAPÍTULO {index}</p>
      <div className="my-6 h-px w-16" style={{ background: "#7B2CBF66" }} />
      <h2 className="font-display text-3xl md:text-4xl font-bold">{title}</h2>
    </div>
  );
}