import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getAllLessons } from "@/features/lessons/api";
import { GroupedLessonList } from "@/features/lessons/GroupedLessonList";

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
      <div className="mx-auto w-full max-w-3xl px-6 pt-10">
        <div className="font-mono text-sm text-slate-steel mb-6">
          <span className="text-emerald-signal">~</span> $ ls lessons/
        </div>
        {lessons.length > 0 ? (
          <GroupedLessonList lessons={lessons} />
        ) : (
          <p className="font-mono text-sm text-slate-steel">
            No lessons found.
          </p>
        )}
      </div>

      <div className="mt-auto shrink-0 border-t border-charcoal/50 bg-carbon">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3 font-mono text-xs text-slate-steel">
          <span>
            <span className="text-emerald-signal">~</span> ${" "}
            {lessons.length} lesson{lessons.length !== 1 && "s"} available
          </span>
          <span className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/in/pmartin-dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-charcoal hover:text-slate-steel transition-colors"
            >
              @pmartin
            </a>
            <span className="hidden sm:inline">
              <kbd className="rounded border border-charcoal bg-abyss px-1.5 py-0.5">
                ↑↓
              </kbd>{" "}
              select{" "}
              <kbd className="ml-2 rounded border border-charcoal bg-abyss px-1.5 py-0.5">
                enter
              </kbd>{" "}
              open
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
