import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EditorView } from "@/components/EditorView";

export const Route = createFileRoute("/book/$bookId/edit")({
  component: BookEdit,
});

function BookEdit() {
  const { bookId } = Route.useParams();
  const navigate = useNavigate();

  return (
    <EditorView
      storyId={bookId}
      onBack={() => navigate({ to: "/" })}
      onRead={(chapterId) =>
        navigate({
          to: "/book/$bookId/read",
          params: { bookId },
          search: chapterId ? { chapterId } : undefined,
        })
      }
    />
  );
}
