import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { LessonMeta } from "./schema";
import type { ProgressData } from "@/features/progress/store";
import { progressStore } from "@/features/progress/store";
import { LessonCard } from "./LessonCard";
import { useZoneKeyboard } from "@/shared/hooks/useKeyZone";

type SubZone = "filters" | "cards";

function useGridColumns(ref: React.RefObject<HTMLDivElement | null>): number {
  const [cols, setCols] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const first = el.children[0] as HTMLElement | undefined;
      if (!first) return;
      const gridWidth = el.clientWidth;
      const itemWidth = first.offsetWidth;
      if (itemWidth > 0) setCols(Math.round(gridWidth / itemWidth));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return cols;
}

export function LessonCatalog({ lessons }: { lessons: LessonMeta[] }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ProgressData>({});
  const [selected, setSelected] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [subZone, setSubZone] = useState<SubZone>("cards");
  const [filterIndex, setFilterIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const cols = useGridColumns(gridRef);

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

  const categoryOptions = useMemo<Array<string | null>>(
    () => [null, ...categories],
    [categories],
  );

  // Sync filterIndex when activeCategory changes externally (click)
  const syncFilterIndex = useCallback(
    (cat: string | null) => {
      setFilterIndex(Math.max(0, categoryOptions.indexOf(cat)));
    },
    [categoryOptions],
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
        if (subZone === "filters") {
          setFilterIndex((i) => {
            const next = (i - 1 + categoryOptions.length) % categoryOptions.length;
            setActiveCategory(categoryOptions[next]);
            return next;
          });
        } else {
          setSelected((s) => Math.max(s - 1, 0));
        }
      },
      ArrowRight: (e: KeyboardEvent) => {
        e.preventDefault();
        if (subZone === "filters") {
          setFilterIndex((i) => {
            const next = (i + 1) % categoryOptions.length;
            setActiveCategory(categoryOptions[next]);
            return next;
          });
        } else {
          setSelected((s) => Math.min(s + 1, navigable.length - 1));
        }
      },
      ArrowUp: (e: KeyboardEvent) => {
        e.preventDefault();
        if (subZone === "cards") {
          setSelected((s) => {
            const next = s - cols;
            if (next < 0) {
              setSubZone("filters");
              return s;
            }
            return next;
          });
        }
      },
      ArrowDown: (e: KeyboardEvent) => {
        e.preventDefault();
        if (subZone === "filters") {
          setSubZone("cards");
        } else {
          setSelected((s) => Math.min(s + cols, navigable.length - 1));
        }
      },
      Enter: (e: KeyboardEvent) => {
        e.preventDefault();
        if (subZone === "cards") open();
      },
      Escape: (e: KeyboardEvent) => {
        e.preventDefault();
        if (subZone === "filters") {
          setSubZone("cards");
        } else {
          navigate({ to: "/" });
        }
      },
    }),
    [categoryOptions, navigable.length, open, navigate, subZone, cols],
  );

  useZoneKeyboard("content", handlers);

  let navIndex = 0;

  return (
    <div>
      {/* Category filter — pill buttons */}
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        {categoryOptions.map((cat, i) => (
          <button
            key={cat ?? "__all"}
            type="button"
            onClick={() => {
              setActiveCategory(cat);
              syncFilterIndex(cat);
              setSubZone("filters");
            }}
            className={`cursor-pointer rounded-full border px-4 py-1.5 font-medium transition-colors ${
              activeCategory === cat
                ? subZone === "filters" && filterIndex === i
                  ? "border-brand bg-brand-bg text-brand ring-2 ring-brand/20"
                  : "border-brand/30 bg-brand-bg text-brand"
                : subZone === "filters" && filterIndex === i
                  ? "border-brand/50 text-primary ring-2 ring-brand/20"
                  : "border-subtle text-muted hover:text-primary hover:border-secondary"
            }`}
          >
            {cat ?? "All"}
          </button>
        ))}
      </div>

      {/* Lesson grid */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((lesson) => {
          const isNavigable = !lesson.draft;
          const currentNavIndex = isNavigable ? navIndex++ : -1;

          return (
            <LessonCard
              key={lesson.slug}
              lesson={lesson}
              completed={progress[lesson.slug]?.completed ?? false}
              currentStep={progress[lesson.slug]?.currentStep}
              isSelected={subZone === "cards" && currentNavIndex === selected}
            />
          );
        })}
      </div>
    </div>
  );
}
