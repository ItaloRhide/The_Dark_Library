import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { feedbackApi, type Feedback, type FeedbackType } from "@/lib/api";

const TYPE_LABELS: Record<FeedbackType, string> = {
  bug: "Bug",
  suggestion: "Sugestão",
  other: "Outro",
};

const STATUS_OPTIONS: { value: Feedback["status"]; label: string }[] = [
  { value: "new", label: "Nova" },
  { value: "read", label: "Lida" },
  { value: "resolved", label: "Resolvida" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FeedbackInbox({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setItems(await feedbackApi.list());
    } catch {
      setError("Não foi possível carregar os feedbacks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const setStatus = async (id: string, status: Feedback["status"]) => {
    try {
      await feedbackApi.setStatus(id, status);
      setItems((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
    } catch {
      setError("Não foi possível atualizar o status.");
    }
  };

  const unread = items.filter((f) => f.status === "new").length;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(6, 0, 18, 0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #240046, #16002e)",
          borderColor: "#9D4EDD44",
          boxShadow: "0 30px 80px -20px #000000cc, inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 md:p-8 pb-4">
          <div>
            <p className="font-display tracking-[0.4em] text-[10px]" style={{ color: "#C77DFF" }}>
              CAIXA DE FEEDBACK
            </p>
            <h2 className="font-display text-2xl font-bold mt-1" style={{ color: "#E0AAFF" }}>
              Mensagens do leitor
            </h2>
            {unread > 0 && (
              <p className="text-xs mt-1" style={{ color: "#FF8FA3" }}>
                {unread} nova{unread > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button onClick={onClose} aria-label="Fechar" className="p-1 rounded-full opacity-60 hover:opacity-100 transition" style={{ color: "#E0AAFF" }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-8 space-y-4">
          {loading ? (
            <p className="text-center py-12 italic" style={{ color: "#C77DFF" }}>
              Abrindo a caixa de mensagens...
            </p>
          ) : error ? (
            <p className="text-center py-12 text-sm" style={{ color: "#FF8FA3" }}>
              {error}
            </p>
          ) : items.length === 0 ? (
            <p className="text-center py-12 italic" style={{ color: "#C77DFF" }}>
              Nenhum feedback por enquanto.
            </p>
          ) : (
            items.map((f) => (
              <div
                key={f.id}
                className="rounded-2xl border p-4"
                style={{
                  background: "rgba(16,0,43,0.55)",
                  borderColor: f.status === "new" ? "#C77DFF88" : "#9D4EDD33",
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="font-display tracking-widest text-[10px] px-3 py-1 rounded-full border"
                    style={{
                      borderColor: "#C77DFF66",
                      color: "#E0AAFF",
                      background: "rgba(199,125,255,0.12)",
                    }}
                  >
                    {TYPE_LABELS[f.type].toUpperCase()}
                  </span>
                  <span className="text-xs opacity-70 flex-1" style={{ color: "#C77DFF" }}>
                    {f.user_email}
                  </span>
                  <span className="text-[11px] opacity-60" style={{ color: "#9D4EDD" }}>
                    {formatDate(f.created_at)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#E0AAFF" }}>
                  {f.message}
                </p>
                {f.page && (
                  <p className="mt-3 text-xs opacity-60 truncate" style={{ color: "#9D4EDD" }}>
                    Página: {f.page}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  {STATUS_OPTIONS.map((s) => {
                    const active = f.status === s.value;
                    return (
                      <button
                        key={s.value}
                        onClick={() => setStatus(f.id, s.value)}
                        className="px-3 py-1.5 rounded-full text-xs font-display tracking-wider border transition"
                        style={{
                          borderColor: active ? "#C77DFF" : "#9D4EDD33",
                          background: active ? "rgba(199,125,255,0.18)" : "transparent",
                          color: active ? "#E0AAFF" : "#9D4EDD",
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}