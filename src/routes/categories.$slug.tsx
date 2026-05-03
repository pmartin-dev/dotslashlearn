import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getLessonsByCategory } from "@/features/lessons/api";
import { CategoryView } from "@/features/lessons/CategoryView";
import { NotFound } from "@/shared/components/NotFound";
import { buildSeo } from "@/shared/seo/meta";

const fetchCategory = createServerFn()
  .inputValidator((slug: string) => slug)
  .handler(({ data: slug }) => {
    const category = getLessonsByCategory(slug);
    if (!category) throw notFound();
    return category;
  });

export const Route = createFileRoute("/categories/$slug")({
  loader: ({ params }) => fetchCategory({ data: params.slug }),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const lessonCount =
      loaderData.uncategorized.length +
      loaderData.subcategories.reduce((n, s) => n + s.lessons.length, 0);
    return buildSeo({
      title: loaderData.name,
      description: `${lessonCount} deep-dive lesson${lessonCount !== 1 ? "s" : ""} on ${loaderData.name}. Step-by-step explainers with quizzes.`,
      path: `/categories/${loaderData.slug}`,
    });
  },
  pendingComponent: () => (
    <div className="flex h-full items-center justify-center">
      <span className="text-sm text-muted animate-pulse">
        Loading...
      </span>
    </div>
  ),
  notFoundComponent: () => <NotFound message="Category not found." />,
  component: CategoryPage,
});

function CategoryPage() {
  const category = Route.useLoaderData();
  const totalLessons =
    category.uncategorized.length +
    category.subcategories.reduce((sum, s) => sum + s.lessons.length, 0);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-3xl px-6 pt-10">
        <h1 className="font-display text-2xl font-semibold text-primary mb-6">
          {category.name}
        </h1>
        {totalLessons > 0 ? (
          <CategoryView category={category} />
        ) : (
          <p className="text-sm text-muted">
            No lessons found in this category.
          </p>
        )}
      </div>

      <div className="mt-auto shrink-0 border-t border-subtle bg-surface-dim">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3 text-xs text-muted">
          <span>
            {totalLessons} lesson{totalLessons !== 1 && "s"} in{" "}
            {category.name}
          </span>
          <span className="hidden sm:flex items-center gap-3">
            <span>
              <kbd className="rounded-md border border-subtle bg-surface px-1.5 py-0.5 text-[11px] font-mono">↑↓</kbd> select
            </span>
            <span>
              <kbd className="rounded-md border border-subtle bg-surface px-1.5 py-0.5 text-[11px] font-mono">enter</kbd> open
            </span>
            <span>
              <kbd className="rounded-md border border-subtle bg-surface px-1.5 py-0.5 text-[11px] font-mono">esc</kbd> back
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
