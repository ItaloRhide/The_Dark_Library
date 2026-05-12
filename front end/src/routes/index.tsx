import { createFileRoute } from "@tanstack/react-router";
import { LibraryView } from "@/components/LibraryView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Dark Library — Escreva suas histórias" },
      {
        name: "description",
        content:
          "Uma biblioteca pessoal mágica para escrever, organizar e ler suas próprias histórias e fanfics.",
      },
      { property: "og:title", content: "The Dark Library — Escreva suas histórias" },
      {
        property: "og:description",
        content: "Crie livros, escreva e leia em uma biblioteca interativa.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <LibraryView />;
}
