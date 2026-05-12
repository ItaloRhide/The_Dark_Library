import { useEffect, useState } from "react";
import { BookSpine } from "./BookSpine";
import {
  booksApi,
  type Book,
} from "@/lib/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { BookPreview } from "./BookPreview";

export function LibraryView() {
  const [stories, setStories] = useState<Book[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "rename">("create");
  const [dialogValue, setDialogValue] = useState("");
  const [targetStoryId, setTargetStoryId] = useState<string | null>(null);

  const refreshStories = async () => {
    try {
      const data = await booksApi.list();
      setStories(data);
    } catch (err) {
      console.error("Failed to fetch stories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStories();
  }, []);

  const handleNew = () => {
    setDialogMode("create");
    setDialogValue("");
    setIsDialogOpen(true);
  };

  const handleRename = (id: string) => {
    const cur = stories.find((s) => s.id === id);
    if (!cur) return;
    setTargetStoryId(id);
    setDialogMode("rename");
    setDialogValue(cur.title);
    setIsDialogOpen(true);
  };

  const handleDialogConfirm = async () => {
    try {
      if (dialogMode === "create") {
        const book = await booksApi.create(dialogValue.trim() || "Sem título");
        navigate({ to: "/book/$bookId/edit", params: { bookId: book.id } });
      } else if (dialogMode === "rename" && targetStoryId) {
        await booksApi.update(targetStoryId, { title: dialogValue.trim() || "Sem título" });
        refreshStories();
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Failed to save book", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remover este livro? Esta ação não pode ser desfeita.")) return;
    try {
      await booksApi.delete(id);
      refreshStories();
    } catch (err) {
      console.error("Failed to delete book", err);
    }
  };

  const previewStory = previewId ? stories.find((s) => s.id === previewId) : null;

  // Group books into shelves of 8
  const shelves: Book[][] = [];
  for (let i = 0; i < Math.max(stories.length, 1); i += 8) {
    shelves.push(stories.slice(i, i + 8));
  }

  return (
    <div className="relative min-h-screen">
      <header className="relative z-10 max-w-6xl mx-auto px-6 pt-14 pb-8 text-center">
        <p className="font-display tracking-[0.4em] text-xs mb-3" style={{ color: "#E0AAFF" }}>BIBLIOTECA PESSOAL</p>
        <h1 className="font-display text-5xl md:text-6xl font-bold" style={{ color: "#E0AAFF" }}>
          The Dark Library
        </h1>
        <p className="mt-3 italic text-base md:text-lg" style={{ color: "#C77DFF" }}>
          Cada livro é um mundo esperando para ser escrito.
        </p>
        <button
          onClick={handleNew}
          disabled={loading}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-display tracking-wider text-sm transition-all hover:scale-105 disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
            color: "#10002B",
            boxShadow: "0 6px 20px -4px #9D4EDD80",
          }}
        >
          {loading ? "Carregando..." : "+ Novo Livro"}
        </button>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="text-center py-20 italic" style={{ color: "#C77DFF" }}>
            Abrindo as portas da biblioteca...
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20 italic" style={{ color: "#C77DFF" }}>
            A estante está vazia. Comece criando seu primeiro livro.
          </div>
        ) : (
          <div className="space-y-16">
            {shelves.map((shelf, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-end justify-center gap-3 md:gap-4 min-h-[260px] pb-2 px-4">
                  {shelf.map((s) => (
                    <BookSpine
                      key={s.id}
                      story={s}
                      onOpen={() => setPreviewId(s.id)}
                      onEdit={() => navigate({ to: "/book/$bookId/edit", params: { bookId: s.id } })}
                      onDelete={() => handleDelete(s.id)}
                      onRename={() => handleRename(s.id)}
                    />
                  ))}
                </div>
                {/* Shelf plank */}
                <div
                  className="h-5 rounded-sm relative"
                  style={{
                    background: "var(--gradient-shelf)",
                    boxShadow: "0 10px 25px -8px oklch(0 0 0 / 0.6), inset 0 -2px 0 oklch(0 0 0 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.1)",
                  }}
                >
                  <div className="absolute inset-x-4 -top-1 h-1 rounded-full opacity-30" style={{ background: "oklch(0 0 0 / 0.3)" }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {previewStory && (
        <BookPreview
          story={previewStory}
          onClose={() => setPreviewId(null)}
          onEdit={() => {
            setPreviewId(null);
            navigate({ to: "/book/$bookId/edit", params: { bookId: previewStory.id } });
          }}
          onRead={() => {
            setPreviewId(null);
            navigate({ to: "/book/$bookId/read", params: { bookId: previewStory.id } });
          }}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#10002b]/95 border-[#5a189a] backdrop-blur-md shadow-[0_0_30px_rgba(157,78,221,0.2)]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-[#e0aaff]">
              {dialogMode === "create" ? "Novo Livro" : "Renomear Livro"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={dialogValue}
              onChange={(e) => setDialogValue(e.target.value)}
              placeholder="Título da história..."
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleDialogConfirm()}
              className="bg-[#240046]/50 border-[#7b2cbf] text-white placeholder:text-[#9d4edd]/50 focus-visible:ring-[#9d4edd]"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="text-[#c77dff] hover:text-white hover:bg-[#3c096c]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDialogConfirm}
              className="bg-gradient-to-r from-[#9d4edd] to-[#7b2cbf] hover:from-[#7b2cbf] hover:to-[#5a189a] text-white border-none shadow-[0_4px_15px_rgba(123,44,191,0.4)]"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
