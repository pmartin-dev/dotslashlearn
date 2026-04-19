import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { LessonMeta } from "./schema";
import type { ProgressData } from "@/features/progress/store";
import { progressStore } from "@/features/progress/store";
import { LessonCard } from "./LessonCard";

export function LessonCatalog({ lessons }: { lessons: LessonMeta[] }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ProgressData>({});
  const [selected, setSelected] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(lessons.map((l) => l.category))].sort(),
    [lessons],
  );

  const filtered = useMemo(
    () => activeCategory ? lessons.filter((l) => l.category === activeCategory) : lessons,
    [lessons, activeCategory],
  );

  const navigable = useMemo(
    () => filtered.filter((l) => !l.draft),
    [filtered],
  );

  // Reset selection when filter changes
  useEffect(() => {
    setSelected(0);
  }, [activeCategory]);

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
    const lesson = navigable[selected];
    if (lesson) {
      navigate({ to: "/lessons/$slug", params: { slug: lesson.slug } });
    }
  }, [navigate, navigable, selected]);

  // All category options: [null, ...categories]
  const categoryOptions = useMemo<Array<string | null>>(
    () => [null, ...categories],
    [categories],
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Tab / Shift+Tab to cycle categories
      if (e.key === "Tab") {
        e.preventDefault();
        setActiveCategory((current) => {
          const idx = categoryOptions.indexOf(current);
          if (e.shiftKey) {
            return categoryOptions[(idx - 1 + categoryOptions.length) % categoryOptions.length];
          }
          return categoryOptions[(idx + 1) % categoryOptions.length];
        });
        return;
      }
      if (e.key === "ArrowRight" || e.key === "l") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, navigable.length - 1));
      }
      if (e.key === "ArrowLeft" || e.key === "h") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, navigable.length - 1));
      }
      if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        open();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigable, open, categoryOptions]);

  // Build a set of navigable slugs to track selected index
  let navIndex = 0;

  return (
    <div>
      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`cursor-pointer rounded border px-3 py-1.5 transition-colors ${
            activeCategory === null
              ? "border-emerald-signal/40 bg-emerald-signal/10 text-emerald-signal"
              : "border-charcoal text-slate-steel hover:text-snow hover:border-slate-steel"
          }`}
        >
          ALL
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`cursor-pointer rounded border px-3 py-1.5 transition-colors ${
              activeCategory === cat
                ? "border-emerald-signal/40 bg-emerald-signal/10 text-emerald-signal"
                : "border-charcoal text-slate-steel hover:text-snow hover:border-slate-steel"
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Lesson grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {filtered.map((lesson) => {
        const isNavigable = !lesson.draft;
        const currentNavIndex = isNavigable ? navIndex++ : -1;

        return (
          <LessonCard
            key={lesson.slug}
            lesson={lesson}
            completed={progress[lesson.slug]?.completed ?? false}
            currentStep={progress[lesson.slug]?.currentStep}
            isSelected={currentNavIndex === selected}
          />
        );
      })}
      </div>
    </div>
  );
}
