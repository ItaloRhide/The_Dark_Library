import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ReaderView } from "@/components/ReaderView";
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
    <ReaderView
      storyId={bookId}
      initialChapterId={chapterId}
      onBack={() => navigate({ to: "/" })}
      onEdit={() => navigate({ to: "/book/$bookId/edit", params: { bookId } })}
    />
  );
}
