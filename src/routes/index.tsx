import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getAllLessons } from "@/features/lessons/api";
import { LessonCatalog } from "@/features/lessons/LessonCatalog";

const fetchAllLessons = createServerFn().handler(() => {
  return getAllLessons();
});

export const Route = createFileRoute("/")({
  loader: () => fetchAllLessons(),
  pendingComponent: () => (
    <div className="flex h-full items-center justify-center">
      <span className="font-mono text-sm text-slate-steel animate-pulse">
        loading...
      </span>
    </div>
  ),
  component: Home,
});

function Home() {
  const lessons = Route.useLoaderData();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-6">
        {/* Terminal prompt */}
        <div className="font-mono text-sm text-slate-steel mb-2">
          <span className="text-volt-mint">~/learn</span>
          <span className="text-slate-steel"> $ ls -la</span>
        </div>

        {/* Title */}
        <h1 className="font-mono text-4xl sm:text-5xl font-bold text-snow/20 mb-8 tracking-tight">
          CATALOG_
        </h1>

        {/* Lesson grid */}
        {lessons.length > 0 ? (
          <LessonCatalog lessons={lessons} />
        ) : (
          <p className="font-mono text-sm text-slate-steel">
            No lessons found.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-charcoal/50 bg-carbon">
        <div className="flex items-center justify-between px-6 py-3 font-mono text-xs text-slate-steel">
          <span>
            {lessons.length} lesson{lessons.length !== 1 && "s"} available
          </span>
          <span className="hidden sm:flex items-center gap-3">
            <span>
              <kbd className="rounded border border-charcoal bg-abyss px-1.5 py-0.5">↑↓←→</kbd> navigate
            </span>
            <span>
              <kbd className="rounded border border-charcoal bg-abyss px-1.5 py-0.5">tab</kbd> category
            </span>
            <span>
              <kbd className="rounded border border-charcoal bg-abyss px-1.5 py-0.5">enter</kbd> open
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
