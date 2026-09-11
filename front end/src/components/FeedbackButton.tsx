import { useEffect, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { MessageSquareText, Send, X } from "lucide-react";
import { feedbackApi, type FeedbackType } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const TYPE_LABELS: { value: FeedbackType; label: string }[] = [
  { value: "bug", label: "Bug" },
  { value: "suggestion", label: "Sugestão" },
  { value: "other", label: "Outro" },
];

export function FeedbackButton() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("bug");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const page = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    setTimeout(() => textareaRef.current?.focus(), 50);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!user) return null;

  const valid = message.trim().length >= 10;

  const submit = async () => {
    if (!valid || sending) return;
    setSending(true);
    setError(null);
    try {
      await feedbackApi.submit({ type, message: message.trim(), page });
      setSent(true);
    } catch {
      setError("Não foi possível enviar. Tente novamente em instantes.");
    } finally {
      setSending(false);
    }
  };

  const close = () => {
    setOpen(false);
    setSent(false);
    setMessage("");
    setError(null);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Enviar feedback"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-5 py-3 font-display tracking-widest text-sm text-[#10002B] transition hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #E0AAFF, #C77DFF)",
          boxShadow: "0 8px 28px -6px #C77DFF80",
        }}
      >
        <MessageSquareText size={18} />
        <span>Feedback</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(6, 0, 18, 0.7)", backdropFilter: "blur(6px)" }}
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-3xl p-6 md:p-8 border"
            style={{
              background: "linear-gradient(180deg, #240046, #16002e)",
              borderColor: "#9D4EDD44",
              boxShadow: "0 30px 80px -20px #000000cc, inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display tracking-[0.4em] text-[10px]" style={{ color: "#C77DFF" }}>
                  CANAL DE FEEDBACK
                </p>
                <h2 className="font-display text-2xl font-bold mt-1" style={{ color: "#E0AAFF" }}>
                  {sent ? "Recebido!" : "Fale com o suporte"}
                </h2>
              </div>
              <button onClick={close} aria-label="Fechar" className="p-1 rounded-full opacity-60 hover:opacity-100 transition" style={{ color: "#E0AAFF" }}>
                <X size={20} />
              </button>
            </div>

            {sent ? (
              <div className="mt-8 text-center">
                <div className="text-5xl mb-4">🕯️</div>
                <p className="italic" style={{ color: "#C77DFF" }}>
                  Obrigado por ajudar a melhorar a biblioteca.
                </p>
                <p className="text-sm mt-2 opacity-70" style={{ color: "#E0AAFF" }}>
                  Sua mensagem foi enviada para{" "}
                  <strong style={{ color: "#E0AAFF" }}>dark.library.suport@gmail.com</strong> e será
                  respondida.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-6 flex gap-2">
                  {TYPE_LABELS.map((t) => {
                    const active = type === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => setType(t.value)}
                        className="flex-1 rounded-full px-3 py-2 text-sm font-display tracking-wider border transition"
                        style={{
                          borderColor: active ? "#C77DFF" : "#C77DFF33",
                          background: active ? "rgba(199,125,255,0.18)" : "transparent",
                          color: active ? "#E0AAFF" : "#9D4EDD",
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={5000}
                  placeholder={
                    type === "bug"
                      ? "Descreva o que aconteceu, o que você esperava e como reproduzir... (mínimo 10 caracteres)"
                      : "Conte sua ideia ou o que você notou... (mínimo 10 caracteres)"
                  }
                  className="mt-4 w-full rounded-2xl border p-4 text-sm resize-none outline-none leading-relaxed"
                  style={{
                    background: "#10002B",
                    borderColor: "#C77DFF44",
                    color: "#E0AAFF",
                  }}
                />

                <p className="mt-3 text-xs opacity-70" style={{ color: "#C77DFF" }}>
                  Página: <span style={{ color: "#E0AAFF" }}>{page}</span> · Seu email:{" "}
                  <span style={{ color: "#E0AAFF" }}>{user.email}</span>
                </p>

                {error && (
                  <p className="mt-3 text-xs" style={{ color: "#FF8FA3" }}>
                    {error}
                  </p>
                )}

                <button
                  onClick={submit}
                  disabled={!valid || sending}
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-full py-3 font-display tracking-widest text-sm transition disabled:opacity-40 enabled:hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, #E0AAFF, #C77DFF)",
                    color: "#10002B",
                    boxShadow: "0 8px 24px -6px #C77DFF80",
                  }}
                >
                  <Send size={16} />
                  {sending ? "Enviando..." : "Enviar feedback"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}