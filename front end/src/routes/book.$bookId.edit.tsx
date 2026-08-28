import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EditorView } from "@/components/EditorView";
import deskBg from "@/assets/desk.png";

export const Route = createFileRoute("/book/$bookId/edit")({
  component: BookEdit,
});

function BookEdit() {
  const { bookId } = Route.useParams();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center opacity-70 pointer-events-none"
        style={{ backgroundImage: `url(${deskBg})` }}
      />
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
    </div>
  );
}
