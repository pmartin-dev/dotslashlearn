import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { CategoryDetail } from "./schema";
import type { ProgressData } from "@/features/progress/store";
import { progressStore } from "@/features/progress/store";
import { LessonRow } from "./LessonRow";

export function CategoryView({ category }: { category: CategoryDetail }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ProgressData>({});

  const allLessons = useMemo(
    () => [
      ...category.uncategorized,
      ...category.subcategories.flatMap((sub) => sub.lessons),
    ],
    [category],
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
      if (e.key === "Escape") {
        e.preventDefault();
        navigate({ to: "/" });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [allLessons, open, navigate]);

  // Track a running index across all sections
  let runningIndex = 0;

  return (
    <div className="grid gap-1">
      {/* Uncategorized lessons (no subcategory) */}
      {category.uncategorized.map((lesson) => {
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

      {/* Subcategory sections */}
      {category.subcategories.map((sub) => (
        <div key={sub.name}>
          <div className="px-3 pt-4 pb-1 text-xs text-muted font-medium">
            {sub.name}
          </div>
          {sub.lessons.map((lesson) => {
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
      ))}
    </div>
  );
}
