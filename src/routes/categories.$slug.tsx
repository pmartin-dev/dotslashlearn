import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getLessonsByCategory } from "@/features/lessons/api";
import { CategoryView } from "@/features/lessons/CategoryView";
import { NotFound } from "@/shared/components/NotFound";

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
    return {
      meta: [{ title: `${loaderData.name} - ./learn` }],
    };
  },
  pendingComponent: () => (
    <div className="flex h-full items-center justify-center">
      <span className="font-mono text-sm text-slate-steel animate-pulse">
        loading...
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
        <div className="font-mono text-sm text-slate-steel mb-6">
          <span className="text-emerald-signal">~</span> $ ls{" "}
          {category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/
        </div>
        {totalLessons > 0 ? (
          <CategoryView category={category} />
        ) : (
          <p className="font-mono text-sm text-slate-steel">
            No lessons found in this category.
          </p>
        )}
      </div>

      <div className="mt-auto shrink-0 border-t border-charcoal/50 bg-carbon">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3 font-mono text-xs text-slate-steel">
          <span>
            <span className="text-emerald-signal">~</span> ${" "}
            {totalLessons} lesson{totalLessons !== 1 && "s"} in{" "}
            {category.name}
          </span>
          <span className="flex items-center gap-4">
            <span className="hidden sm:inline">
              <kbd className="rounded border border-charcoal bg-abyss px-1.5 py-0.5">
                ↑↓
              </kbd>{" "}
              select{" "}
              <kbd className="ml-2 rounded border border-charcoal bg-abyss px-1.5 py-0.5">
                enter
              </kbd>{" "}
              open{" "}
              <kbd className="ml-2 rounded border border-charcoal bg-abyss px-1.5 py-0.5">
                esc
              </kbd>{" "}
              back
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
