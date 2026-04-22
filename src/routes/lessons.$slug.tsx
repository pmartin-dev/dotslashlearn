import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getLesson } from "@/features/lessons/api";
import { LessonViewer } from "@/features/lessons/LessonViewer";
import { NotFound } from "@/shared/components/NotFound";

const fetchLesson = createServerFn()
  .inputValidator((slug: string) => slug)
  .handler(({ data: slug }) => {
    const lesson = getLesson(slug);
    if (!lesson) throw notFound();
    return lesson;
  });

export const Route = createFileRoute("/lessons/$slug")({
  loader: ({ params }) => fetchLesson({ data: params.slug }),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return {
      meta: [
        { title: `${loaderData.title} - ./learn` },
        { name: "description", content: loaderData.description },
      ],
    };
  },
  pendingComponent: () => (
    <div className="flex h-full items-center justify-center">
      <span className="text-sm text-muted animate-pulse">
        Loading lesson...
      </span>
    </div>
  ),
  notFoundComponent: () => <NotFound message="Lesson not found." />,
  component: LessonPage,
});

function LessonPage() {
  const lesson = Route.useLoaderData();

  return (
    <LessonViewer slug={lesson.slug} title={lesson.title} steps={lesson.steps} category={lesson.category} />
  );
}
