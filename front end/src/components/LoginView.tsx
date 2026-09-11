import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Mail, Lock, ArrowLeft, Eye, EyeOff, BookOpen, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import loginBg from "@/assets/login-background.png";

type Tab = "login" | "register" | "verify";

const errorMessage: Record<string, string> = {
  EMAIL_ALREADY_REGISTERED: "Este email já está cadastrado. Faça login ou volte para verificar o código.",
  INVALID_OR_EXPIRED_CODE: "Código inválido ou expirado. Tente novamente.",
  INVALID_CREDENTIALS: "Email ou senha incorretos.",
  EMAIL_NOT_VERIFIED: "Conta ainda não verificada. Verifique seu código primeiro.",
  UNAUTHORIZED: "Sessão inválida. Entre novamente.",
  INVALID_INPUT: "Preencha os campos corretamente.",
};

export function LoginView() {
  const navigate = useNavigate();
  const { login, register, verify, isAuthenticated } = useAuth();

  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Já autenticado? Vai direto para a biblioteca
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/library" });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null; // evita flash do formulário enquanto redireciona
  }

  const handleTab = (t: Tab) => {
    setTab(t);
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate({ to: "/library" });
    } catch (err: any) {
      if (err?.response?.data?.error === "EMAIL_NOT_VERIFIED") {
        setTab("verify");
        setError("");
        setSuccess("Você já se cadastrou. Insira o código enviado para o seu email.");
      } else {
        setError(errorMessage[err?.response?.data?.error] ?? "Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const needsVerification = await register(email, password);
      if (needsVerification) {
        setSuccess("Enviamos um código de verificação para o seu email.");
        setTab("verify");
        setCode("");
      } else {
        await login(email, password);
        navigate({ to: "/library" });
      }
    } catch (err: any) {
      setError(errorMessage[err?.response?.data?.error] ?? "Não foi possível criar a conta.");
      if (err?.response?.data?.error === "EMAIL_ALREADY_REGISTERED") {
        setTab("verify");
        setError("");
        setSuccess("Você já se cadastrou. Insira o código enviado para verificar sua conta.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verify(email, code);
      setSuccess("Conta verificada com sucesso! Agora é só entrar.");
      setCode("");
      setTab("login");
    } catch (err: any) {
      setError(errorMessage[err?.response?.data?.error] ?? "Falha na verificação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img
        src={loginBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay leve (mais claro à direita, onde fica o box) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-end">
        <div className="w-full max-w-lg px-6 pr-6 md:pr-16 lg:pr-24 py-10">
          <form
            onSubmit={tab === "login" ? handleLogin : tab === "register" ? handleRegister : handleVerify}
            className="options-rise-anim group w-full rounded-[28px] border p-10 md:p-12 transition-all duration-500 hover:border-[#C77DFF]/40 hover:-translate-y-1 hover:shadow-[0_40px_90px_-30px_#9D4EDD99,inset_0_1px_0_rgba(255,255,255,0.1)]"
            style={{
              background: "linear-gradient(180deg, rgba(26,0,51,0.72), rgba(16,0,43,0.62))",
              borderColor: "#9D4EDD44",
              backdropFilter: "blur(16px)",
              boxShadow:
                "0 30px 70px -25px #000000cc, inset 0 1px 0 rgba(255,255,255,0.07)",
            }}
          >
            {/* Cabeçalho */}
            <div className="mb-8 text-center">
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border"
                style={{
                  background: "linear-gradient(135deg, rgba(157,78,221,0.25), rgba(60,9,108,0.4))",
                  borderColor: "#9D4EDD55",
                  color: "#E0AAFF",
                }}
              >
                <BookOpen className="h-7 w-7" />
              </div>
              <h1
                className="font-display text-3xl font-bold leading-tight"
                style={{ color: "#E0AAFF" }}
              >
                The Dark Library
              </h1>
              <p className="mt-2 text-sm italic" style={{ color: "#9D4EDDcc" }}>
                {tab === "login"
                  ? "Entre para mergulhar nas histórias."
                  : tab === "register"
                    ? "Crie sua conta de leitor."
                    : "Confirme o código enviado ao seu email."}
              </p>
            </div>

            {/* Abas */}
            <div
              className="mb-8 grid grid-cols-2 rounded-full border p-1"
              style={{ borderColor: "#9D4EDD44", background: "rgba(16,0,43,0.35)" }}
            >
              <button
                type="button"
                onClick={() => handleTab("login")}
                className={`rounded-full py-2 text-xs font-display tracking-wider transition-all duration-300 ${
                  tab === "login" ? "text-[#10002B]" : "text-[#9D4EDD] hover:text-[#C77DFF]"
                }`}
                style={{
                  background: tab === "login"
                    ? "linear-gradient(135deg, var(--gold), var(--gold-deep))"
                    : "transparent",
                  boxShadow: tab === "login" ? "0 4px 15px -4px #9D4EDD80" : "none",
                }}
              >
                ENTRAR
              </button>
              <button
                type="button"
                onClick={() => handleTab("register")}
                className={`rounded-full py-2 text-xs font-display tracking-wider transition-all duration-300 ${
                  tab === "register" ? "text-[#10002B]" : "text-[#9D4EDD] hover:text-[#C77DFF]"
                }`}
                style={{
                  background: tab === "register"
                    ? "linear-gradient(135deg, var(--gold), var(--gold-deep))"
                    : "transparent",
                  boxShadow: tab === "register" ? "0 4px 15px -4px #9D4EDD80" : "none",
                }}
              >
                CRIAR CONTA
              </button>
            </div>

            {/* Mensagens */}
            {error && (
              <div
                className="mb-6 rounded-xl border px-4 py-3 text-sm"
                style={{
                  borderColor: "#f8717155",
                  background: "rgba(127,29,29,0.25)",
                  color: "#FCA5A5",
                }}
              >
                {error}
              </div>
            )}
            {success && (
              <div
                className="mb-6 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm"
                style={{
                  borderColor: "#4ADE8055",
                  background: "rgba(20,83,45,0.25)",
                  color: "#86EFAC",
                }}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Campos conforme a aba */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-display tracking-wider"
                  style={{ color: "#C77DFF" }}
                >
                  E-MAIL
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: "#9D4EDD" }}
                  />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    disabled={tab === "verify"}
                    className="h-11 pl-10 bg-[#10002B]/50 border-[#7B2CBF]/60 text-white placeholder:text-[#9D4EDD]/50 focus-visible:ring-[#9D4EDD] focus-visible:border-[#C77DFF] transition-colors duration-300 hover:border-[#C77DFF]/50 disabled:opacity-70"
                  />
                </div>
              </div>

              {tab === "login" && (
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-display tracking-wider"
                    style={{ color: "#C77DFF" }}
                  >
                    SENHA
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      style={{ color: "#9D4EDD" }}
                    />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="h-11 pl-10 pr-10 bg-[#10002B]/50 border-[#7B2CBF]/60 text-white placeholder:text-[#9D4EDD]/50 focus-visible:ring-[#9D4EDD] focus-visible:border-[#C77DFF] transition-colors duration-300 hover:border-[#C77DFF]/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition hover:opacity-80"
                      style={{ color: "#9D4EDD" }}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {tab === "register" && (
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-display tracking-wider"
                    style={{ color: "#C77DFF" }}
                  >
                    SENHA (mín. 6 caracteres)
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      style={{ color: "#9D4EDD" }}
                    />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="h-11 pl-10 pr-10 bg-[#10002B]/50 border-[#7B2CBF]/60 text-white placeholder:text-[#9D4EDD]/50 focus-visible:ring-[#9D4EDD] focus-visible:border-[#C77DFF] transition-colors duration-300 hover:border-[#C77DFF]/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition hover:opacity-80"
                      style={{ color: "#9D4EDD" }}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {tab === "verify" && (
                <div>
                  <label
                    htmlFor="code"
                    className="mb-1.5 block text-xs font-display tracking-wider"
                    style={{ color: "#C77DFF" }}
                  >
                    CÓDIGO DE VERIFICAÇÃO
                  </label>
                  <div className="relative">
                    <ShieldCheck
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      style={{ color: "#9D4EDD" }}
                    />
                    <Input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      required
                      maxLength={6}
                      className="h-11 pl-10 pr-3 tracking-[0.5em] text-center font-display text-lg bg-[#10002B]/50 border-[#7B2CBF]/60 text-white placeholder:text-[#9D4EDD]/50 focus-visible:ring-[#9D4EDD] focus-visible:border-[#C77DFF] transition-colors duration-300 hover:border-[#C77DFF]/50"
                    />
                  </div>
                  <p className="mt-2 text-xs italic" style={{ color: "#9D4EDDcc" }}>
                    Não recebeu? Volte para "Criar conta" e tente de novo — um novo código será enviado.
                  </p>
                </div>
              )}
            </div>

            {/* Botão principal */}
            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-display tracking-widest text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_40px_-8px_#9D4EDDcc] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
              style={{
                background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
                color: "#10002B",
                boxShadow: "0 8px 30px -6px #9D4EDD80",
              }}
            >
              {loading
                ? tab === "login"
                  ? "Entrando..."
                  : tab === "register"
                    ? "Enviando..."
                    : "Verificando..."
                : tab === "login"
                  ? "Entrar"
                  : tab === "register"
                    ? "Criar conta"
                    : "Verificar código"}
            </button>

            {tab === "verify" && (
              <button
                type="button"
                onClick={() => handleTab("login")}
                className="mt-4 w-full text-center text-xs transition hover:opacity-80"
                style={{ color: "#9D4EDD" }}
              >
                Já verificou? Voltar para entrar
              </button>
            )}

            {/* Voltar */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="inline-flex items-center gap-1.5 text-xs transition hover:opacity-80"
                style={{ color: "#9D4EDD" }}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar ao início
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}