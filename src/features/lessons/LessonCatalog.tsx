import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { LessonMeta } from "./schema";
import type { ProgressData } from "@/features/progress/store";
import { progressStore } from "@/features/progress/store";
import { LessonCard } from "./LessonCard";
import { useZoneKeyboard } from "@/shared/hooks/useKeyZone";

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

  // All category options: [null, ...categories]
  const categoryOptions = useMemo<Array<string | null>>(
    () => [null, ...categories],
    [categories],
  );

  // Reset selection when filter changes
  const [prevCategory, setPrevCategory] = useState(activeCategory);
  if (activeCategory !== prevCategory) {
    setPrevCategory(activeCategory);
    setSelected(0);
  }

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

  const handlers = useMemo(
    () => ({
      ArrowLeft: (e: KeyboardEvent) => {
        e.preventDefault();
        setActiveCategory((current) => {
          const idx = categoryOptions.indexOf(current);
          return categoryOptions[(idx - 1 + categoryOptions.length) % categoryOptions.length];
        });
      },
      ArrowRight: (e: KeyboardEvent) => {
        e.preventDefault();
        setActiveCategory((current) => {
          const idx = categoryOptions.indexOf(current);
          return categoryOptions[(idx + 1) % categoryOptions.length];
        });
      },
      ArrowDown: (e: KeyboardEvent) => {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, navigable.length - 1));
      },
      ArrowUp: (e: KeyboardEvent) => {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      },
      Enter: (e: KeyboardEvent) => {
        e.preventDefault();
        open();
      },
      Escape: (e: KeyboardEvent) => {
        e.preventDefault();
        navigate({ to: "/" });
      },
    }),
    [categoryOptions, navigable.length, open, navigate],
  );

  useZoneKeyboard("content", handlers);

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
      <div className="flex flex-col gap-3 max-w-2xl">
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
