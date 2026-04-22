import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getAllLessons } from "@/features/lessons/api";
import { LessonCatalog } from "@/features/lessons/LessonCatalog";

const fetchAllLessons = createServerFn().handler(() => {
  return getAllLessons();
});

export const Route = createFileRoute("/learn")({
  loader: () => fetchAllLessons(),
  pendingComponent: () => (
    <div className="flex h-full items-center justify-center">
      <span className="text-sm text-muted animate-pulse">
        Loading...
      </span>
    </div>
  ),
  component: Learn,
});

function Learn() {
  const lessons = Route.useLoaderData();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-6">
        {/* Title */}
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary/15 mb-8 tracking-tight">
          Catalog
        </h1>

        {/* Lesson grid */}
        {lessons.length > 0 ? (
          <LessonCatalog lessons={lessons} />
        ) : (
          <p className="text-sm text-muted">
            No lessons found.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-subtle bg-surface-dim">
        <div className="flex items-center justify-between px-6 py-3 text-xs text-muted">
          <span>
            {lessons.length} lesson{lessons.length !== 1 && "s"} available
          </span>
          <span className="hidden sm:flex items-center gap-3">
            <span>
              <kbd className="rounded-md border border-subtle bg-surface px-1.5 py-0.5 text-[11px] font-mono">↑↓←→</kbd> navigate
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
