import { useEffect, useMemo, useRef, useState } from "react";
import { booksApi, chaptersApi, getImageUrl, type Book, type Chapter } from "@/lib/api";

type Props = {
  storyId: string;
  onBack: () => void;
  onRead: (chapterId?: string) => void;
};

export function EditorView({ storyId, onBack, onRead }: Props) {
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeId, setActiveId] = useState<string | "toc">("toc");
  const [savedAt, setSavedAt] = useState<number>(Date.now());
  const [loading, setLoading] = useState(true);
  
  const chaptersRef = useRef<Chapter[]>([]);
  const autoSaveTimer = useRef<number | null>(null);

  const fetchBook = async () => {
    try {
      const data = await booksApi.get(storyId);
      setBook(data);
      setChapters(data.chapters || []);
      chaptersRef.current = data.chapters || [];
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch book", err);
      onBack();
    }
  };

  useEffect(() => {
    fetchBook();
  }, [storyId]);

  useEffect(() => {
    chaptersRef.current = chapters;
  }, [chapters]);

  const active = useMemo(
    () => chapters.find((c) => c.id === activeId) ?? null,
    [chapters, activeId]
  );

  const updateChapterLocally = (id: string, patch: Partial<Chapter>) => {
    setChapters((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    
    if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = window.setTimeout(async () => {
      const latestChapters = chaptersRef.current;
      const chapterToSave = latestChapters.find(c => c.id === id);
      if (chapterToSave) {
        try {
          await chaptersApi.update(id, {
            title: chapterToSave.title,
            content: chapterToSave.content,
          });
          setSavedAt(Date.now());
        } catch (err) {
          console.error("Autosave failed", err);
        }
      }
    }, 1500);
  };

  const addChapter = async () => {
    try {
      const nextIndex = chapters.length + 1;
      const ch = await chaptersApi.create(storyId, `Capítulo ${nextIndex}`, nextIndex);
      setChapters((cs) => [...cs, { ...ch, content: "" }]);
      setActiveId(ch.id);
    } catch (err) {
      console.error("Failed to add chapter", err);
    }
  };

  const deleteChapter = async (id: string) => {
    if (chapters.length <= 1) {
      alert("O livro precisa ter ao menos um capítulo.");
      return;
    }
    if (!confirm("Remover este capítulo?")) return;
    try {
      await chaptersApi.delete(id);
      const idx = chapters.findIndex((c) => c.id === id);
      const next = chapters.filter((c) => c.id !== id);
      setChapters(next);
      if (activeId === id) {
        setActiveId(next[Math.max(0, idx - 1)].id);
      }
    } catch (err) {
      console.error("Failed to delete chapter", err);
    }
  };

  const renameChapter = async (id: string) => {
    const cur = chapters.find((c) => c.id === id);
    if (!cur) return;
    const t = prompt("Título do capítulo:", cur.title);
    if (t === null) return;
    try {
      await chaptersApi.update(id, { title: t.trim() || cur.title });
      setChapters((cs) => cs.map((c) => (c.id === id ? { ...c, title: t.trim() || cur.title } : c)));
    } catch (err) {
      console.error("Failed to rename chapter", err);
    }
  };

  if (loading || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#10002B] text-[#E0AAFF] font-display text-xl animate-pulse">
        Lendo pergaminhos...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full animate-fade-in flex"
      style={{ background: "linear-gradient(180deg, #240046, #10002B)" }}
    >
      <aside
        className="w-64 shrink-0 border-r p-4 sticky top-0 h-screen overflow-y-auto"
        style={{
          borderColor: "#9D4EDD33",
          background: "linear-gradient(180deg, #1a0033cc, #10002Bcc)",
          backdropFilter: "blur(8px)",
        }}
      >
        <button
          onClick={onBack}
          className="text-xs mb-6 hover:underline"
          style={{ color: "#C77DFF" }}
        >
          ← Biblioteca
        </button>
        <button
          onClick={() => setActiveId("toc")}
          className="w-full text-left text-xs font-display tracking-[0.3em] mb-2 px-2 py-1.5 rounded transition"
          style={{
            color: activeId === "toc" ? "#10002B" : "#E0AAFF",
            background:
              activeId === "toc" ? "#E0AAFF" : "transparent",
          }}
        >
          ✦ CAPA & SUMÁRIO
        </button>
        <div className="mt-4 mb-2 text-[10px] font-display tracking-[0.3em]" style={{ color: "#9D4EDD" }}>
          CAPÍTULOS
        </div>
        <ul className="space-y-1">
          {chapters.map((c, i) => (
            <li key={c.id}>
              <button
                onClick={() => setActiveId(c.id)}
                className="w-full text-left px-2 py-1.5 rounded text-sm transition group flex items-baseline gap-2"
                style={{
                  color: activeId === c.id ? "#10002B" : "#E0AAFFcc",
                  background: activeId === c.id ? "#C77DFF" : "transparent",
                }}
              >
                <span className="font-display text-xs opacity-60">{String(i + 1).padStart(2, "0")}</span>
                <span className="truncate">{c.title || "Sem título"}</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={addChapter}
          className="mt-4 w-full text-xs font-display tracking-wider px-3 py-2 rounded border transition hover:bg-white/5"
          style={{ borderColor: "#9D4EDD66", color: "#E0AAFF" }}
        >
          + Novo capítulo
        </button>

        <div className="mt-8 text-[10px] italic opacity-60" style={{ color: "#C77DFF" }}>
          Salvo {new Date(savedAt).toLocaleTimeString()}
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-10 backdrop-blur bg-background/80 border-b border-border">
          <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3">
            <span className="text-xs italic" style={{ color: "#9D4EDD" }}>
              {activeId === "toc"
                ? "Capa & Sumário"
                : `Capítulo ${chapters.findIndex((c) => c.id === activeId) + 1}`}
            </span>
            <button
              onClick={() =>
                onRead(activeId === "toc" ? undefined : activeId)
              }
              className="text-sm font-display tracking-wide px-3 py-1.5 rounded transition hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #E0AAFF, #C77DFF)",
                color: "#10002B",
              }}
            >
              📖 Ler
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto py-12 px-4">
          <div
            className="rounded-md p-12 md:p-16"
            style={{
              background: "var(--paper)",
              color: "var(--ink)",
              boxShadow: "var(--shadow-page)",
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent 0 31px, #C77DFF22 31px 32px)",
            }}
          >
            {activeId === "toc" ? (
              <TitleAndToc
                book={book}
                chapters={chapters}
                onTitle={(t) => {
                  setBook(b => b ? {...b, title: t} : null);
                  booksApi.update(storyId, { title: t });
                }}
                onSubtitle={(s) => {
                    setBook(b => b ? {...b, subtitle: s} : null);
                    booksApi.update(storyId, { subtitle: s });
                }}
                onCoverImage={(img) => {
                    setBook(b => b ? {...b, cover_image: img} : null);
                    booksApi.update(storyId, { cover_image: img });
                }}
                onPickChapter={(id) => setActiveId(id)}
                onRenameChapter={renameChapter}
                onDeleteChapter={deleteChapter}
                onAddChapter={addChapter}
              />
            ) : active ? (
              <ChapterEditor
                key={active.id}
                chapter={active}
                index={chapters.findIndex((c) => c.id === active.id) + 1}
                onChange={(p) => updateChapterLocally(active.id, p)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function TitleAndToc({
  book,
  chapters,
  onTitle,
  onSubtitle,
  onCoverImage,
  onPickChapter,
  onRenameChapter,
  onDeleteChapter,
  onAddChapter,
}: {
  book: Book;
  chapters: Chapter[];
  onTitle: (t: string) => void;
  onSubtitle: (s: string) => void;
  onCoverImage: (img: string | undefined) => void;
  onPickChapter: (id: string) => void;
  onRenameChapter: (id: string) => void;
  onDeleteChapter: (id: string) => void;
  onAddChapter: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  
  const handleFile = async (file: File) => {
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      alert("Envie uma imagem PNG, JPEG ou WEBP.");
      return;
    }
    try {
      // Sending original file without compression for debugging
      const updatedBook = await booksApi.updateCover(book.id, file);
      onCoverImage(updatedBook.cover_image);
    } catch (err) {
      console.error("Erro ao fazer upload da capa", err);
      alert("Não foi possível enviar esta imagem.");
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center mb-10">
        <div
          onClick={() => fileRef.current?.click()}
          className="group relative cursor-pointer rounded-md overflow-hidden border-2 border-dashed transition hover:opacity-90"
          style={{
            width: 180,
            height: 250,
            borderColor: "#7B2CBF66",
            background: book.cover_image ? "#1a0033" : "#7B2CBF11",
          }}
          title="Clique para enviar uma capa"
        >
          {book.cover_image ? (
            <img src={getImageUrl(book.cover_image)} alt="Capa" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center px-3 opacity-70">
              <span className="text-3xl mb-2">🖼️</span>
              <span className="font-display tracking-widest text-[10px]">ENVIAR CAPA</span>
              <span className="text-[10px] italic mt-1 opacity-70">PNG ou JPEG</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <span className="font-display tracking-widest text-[10px] text-white">
              {book.cover_image ? "TROCAR CAPA" : "ESCOLHER ARQUIVO"}
            </span>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        {book.cover_image && (
          <button
            onClick={() => onCoverImage(undefined)}
            className="mt-2 text-[11px] italic opacity-60 hover:opacity-100 underline"
          >
            remover capa
          </button>
        )}
      </div>

      <div className="text-center mb-12">
        <p className="font-display tracking-[0.4em] text-[10px] mb-4 opacity-60">
          UMA HISTÓRIA DE
        </p>
        <input
          value={book.title}
          onChange={(e) => onTitle(e.target.value)}
          placeholder="Título do livro"
          className="w-full bg-transparent text-center text-4xl md:text-5xl font-display font-bold outline-none"
        />
        <div className="flex justify-center my-4">
          <span className="h-px w-24" style={{ background: "#7B2CBF66" }} />
        </div>
        <input
          value={book.subtitle || ""}
          onChange={(e) => onSubtitle(e.target.value)}
          placeholder="Subtítulo ou autor"
          className="w-full bg-transparent text-center italic text-lg outline-none opacity-80"
        />
      </div>

      <h2 className="font-display text-2xl mb-1 mt-12">Sumário</h2>
      <div className="h-px w-full mb-6" style={{ background: "#7B2CBF44" }} />

      <ul className="space-y-1">
        {chapters.map((c, i) => (
          <li
            key={c.id}
            className="group flex items-baseline gap-3 py-2 border-b border-dashed"
            style={{ borderColor: "#7B2CBF33" }}
          >
            <span className="font-display text-sm opacity-60 w-6">
              {String(i + 1).padStart(2, "0")}
            </span>
            <button
              onClick={() => onPickChapter(c.id)}
              className="flex-1 text-left text-lg hover:underline"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {c.title || "Sem título"}
            </button>
            <span
              className="flex-1 mx-2 border-b border-dotted opacity-40 hidden md:block"
              style={{ borderColor: "#7B2CBF" }}
            />
            <span className="text-xs opacity-50">
              {wordCount(c.content)} palavras
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition flex gap-1 text-xs">
              <button
                onClick={() => onRenameChapter(c.id)}
                className="px-1.5 py-0.5 rounded hover:bg-black/5"
              >
                ✎
              </button>
              <button
                onClick={() => onDeleteChapter(c.id)}
                className="px-1.5 py-0.5 rounded text-destructive hover:bg-destructive/10"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={onAddChapter}
        className="mt-6 text-sm font-display tracking-wider px-4 py-2 rounded transition hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #9D4EDD, #7B2CBF)",
          color: "#fff",
        }}
      >
        + Adicionar capítulo
      </button>
    </div>
  );
}

function ChapterEditor({
  chapter,
  index,
  onChange,
}: {
  chapter: Chapter;
  index: number;
  onChange: (p: Partial<Chapter>) => void;
}) {
  return (
    <div>
      <p className="font-display tracking-[0.4em] text-[10px] mb-2 opacity-60 text-center">
        CAPÍTULO {index}
      </p>
      <input
        value={chapter.title}
        onChange={(e) => onChange({ title: e.target.value })}
        className="w-full bg-transparent text-3xl md:text-4xl font-display font-bold mb-6 outline-none border-b border-border/40 pb-2 text-center"
        placeholder="Título do capítulo"
      />
      <textarea
        value={chapter.content ?? ""}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder="Comece a escrever este capítulo..."
        className="w-full min-h-[60vh] bg-transparent outline-none resize-none leading-8 text-lg"
        style={{ fontFamily: "var(--font-body)" }}
      />
    </div>
  );
}

function wordCount(s: string | undefined) {
  if (!s) return 0;
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

async function compressImage(
  file: File,
  maxW: number,
  maxH: number,
  quality: number
): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Imagem inválida"));
    i.src = dataUrl;
  });
  let { width, height } = img;
  const ratio = Math.min(maxW / width, maxH / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}
