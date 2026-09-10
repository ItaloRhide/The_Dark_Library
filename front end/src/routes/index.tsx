import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "@/components/HomeView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Dark Library" },
      {
        name: "description",
        content:
          "Uma biblioteca de histórias esperando para ser explorada.",
      },
      { property: "og:title", content: "The Dark Library" },
      {
        property: "og:description",
        content: "Uma biblioteca de histórias esperando para ser explorada.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <HomeView />;
}
