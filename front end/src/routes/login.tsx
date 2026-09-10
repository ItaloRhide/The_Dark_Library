import { createFileRoute } from "@tanstack/react-router";
import { LoginView } from "@/components/LoginView";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — The Dark Library" },
      {
        name: "description",
        content: "Acesse a The Dark Library para mergulhar nas histórias.",
      },
    ],
  }),
  component: LoginRoute,
});

function LoginRoute() {
  return <LoginView />;
}