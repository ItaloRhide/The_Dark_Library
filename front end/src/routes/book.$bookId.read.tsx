import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ReaderView } from "@/components/ReaderView";
import { RequireAuth } from "@/components/RouteGuards";
import { z } from "zod";

export const Route = createFileRoute("/book/$bookId/read")({
  validateSearch: z.object({
    chapterId: z.string().optional(),
  }),
  component: BookRead,
});

function BookRead() {
  const { bookId } = Route.useParams();
  const { chapterId } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <RequireAuth>
      <ReaderView
        storyId={bookId}
        initialChapterId={chapterId}
        onBack={() => navigate({ to: "/library" })}
        onEdit={() => navigate({ to: "/book/$bookId/edit", params: { bookId } })}
      />
    </RequireAuth>
  );
}
