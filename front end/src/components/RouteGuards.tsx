import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="italic text-lg" style={{ color: "#C77DFF" }}>
        Abrindo as portas da biblioteca...
      </p>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

export function RequireOwner({ children }: { children: ReactNode }) {
  const { isOwner, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: "/login" });
    } else if (!loading && isAuthenticated && !isOwner) {
      navigate({ to: "/library" });
    }
  }, [loading, isAuthenticated, isOwner, navigate]);

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated || !isOwner) return null;
  return <>{children}</>;
}