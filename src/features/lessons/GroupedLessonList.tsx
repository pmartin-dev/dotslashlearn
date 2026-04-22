import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { LessonMeta } from "./schema";
import { toSlug } from "./schema";
import type { ProgressData } from "@/features/progress/store";
import { progressStore } from "@/features/progress/store";
import { LessonRow } from "./LessonRow";

interface CategoryGroup {
  name: string;
  slug: string;
  lessons: LessonMeta[];
}

function groupByCategory(lessons: LessonMeta[]): CategoryGroup[] {
  const map = new Map<string, LessonMeta[]>();
  const nameMap = new Map<string, string>();

  for (const lesson of lessons) {
    const slug = toSlug(lesson.category);
    const existing = map.get(slug) ?? [];
    existing.push(lesson);
    map.set(slug, existing);
    nameMap.set(slug, lesson.category);
  }

  return Array.from(map.entries())
    .map(([slug, items]) => ({
      name: nameMap.get(slug)!,
      slug,
      lessons: items,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function GroupedLessonList({ lessons }: { lessons: LessonMeta[] }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ProgressData>({});

  const categories = useMemo(() => groupByCategory(lessons), [lessons]);

  // Flat list of all navigable lessons (skip drafts for keyboard nav)
  const allLessons = useMemo(
    () => categories.flatMap((c) => c.lessons),
    [categories],
  );

  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const refresh = () => setProgress(progressStore.getAll());
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const open = useCallback(() => {
    const lesson = allLessons[selected];
    if (lesson.draft) return;
    navigate({ to: "/lessons/$slug", params: { slug: lesson.slug } });
  }, [navigate, allLessons, selected]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setSelected((s) => {
          let next = s + 1;
          while (next < allLessons.length && allLessons[next].draft) next++;
          return next < allLessons.length ? next : s;
        });
      }
      if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setSelected((s) => {
          let next = s - 1;
          while (next >= 0 && allLessons[next].draft) next--;
          return next >= 0 ? next : s;
        });
      }
      if (e.key === "Enter") {
        e.preventDefault();
        open();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [allLessons, open]);

  let runningIndex = 0;

  return (
    <div className="grid gap-6">
      {categories.map((cat) => {
        const completedCount = cat.lessons.filter(
          (l) => progress[l.slug]?.completed,
        ).length;
        const hasProgress = completedCount > 0;
        const allDone = completedCount === cat.lessons.length;

        return (
          <div key={cat.slug}>
            {/* Category header */}
            <div className="flex items-baseline justify-between px-3 pb-2 text-xs">
              <Link
                to="/categories/$slug"
                params={{ slug: cat.slug }}
                className="text-muted font-medium hover:text-brand transition-colors"
              >
                {cat.name}
              </Link>
              {hasProgress && (
                <span
                  className={
                    allDone ? "text-brand font-medium" : "text-muted"
                  }
                >
                  {completedCount}/{cat.lessons.length}
                </span>
              )}
            </div>

            {/* Lessons */}
            <div className="grid gap-1">
              {cat.lessons.map((lesson) => {
                const idx = runningIndex++;
                return (
                  <LessonRow
                    key={lesson.slug}
                    lesson={lesson}
                    isSelected={idx === selected}
                    completed={progress[lesson.slug]?.completed ?? false}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
