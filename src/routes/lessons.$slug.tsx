import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getLesson } from "@/features/lessons/api";
import { LessonViewer } from "@/features/lessons/LessonViewer";
import { NotFound } from "@/shared/components/NotFound";
import { buildSeo, buildCourseJsonLd } from "@/shared/seo/meta";

const fetchLesson = createServerFn()
  .inputValidator((slug: string) => slug)
  .handler(({ data: slug }) => {
    const lesson = getLesson(slug);
    if (!lesson) throw notFound();
    return lesson;
  });

const lessonSearchSchema = z.object({
  step: z.coerce.number().int().min(0).optional(),
});

export const Route = createFileRoute("/lessons/$slug")({
  validateSearch: lessonSearchSchema,
  loader: ({ params }) => fetchLesson({ data: params.slug }),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const seo = buildSeo({
      title: loaderData.title,
      description: loaderData.description,
      path: `/lessons/${loaderData.slug}`,
      type: "article",
    });
    return {
      ...seo,
      scripts: [
        {
          type: "application/ld+json",
          children: buildCourseJsonLd({
            title: loaderData.title,
            description: loaderData.description,
            slug: loaderData.slug,
            category: loaderData.category,
          }),
        },
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
  const { step } = Route.useSearch();

  return (
    <LessonViewer
      slug={lesson.slug}
      title={lesson.title}
      steps={lesson.steps}
      category={lesson.category}
      initialStep={step}
    />
  );
}
