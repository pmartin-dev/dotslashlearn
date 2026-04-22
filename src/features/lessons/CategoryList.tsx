import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { CategoryMeta } from "./schema";
import type { ProgressData } from "@/features/progress/store";
import { progressStore } from "@/features/progress/store";

export function CategoryList({
  categories,
}: {
  categories: CategoryMeta[];
}) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const [progress, setProgress] = useState<ProgressData>({});

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
    const cat = categories[selected];
    navigate({ to: "/categories/$slug", params: { slug: cat.slug } });
  }, [navigate, categories, selected]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, categories.length - 1));
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
  }, [categories, open]);

  return (
    <div className="grid gap-1">
      {categories.map((cat, i) => {
        const completed = cat.lessonSlugs.filter(
          (s) => progress[s]?.completed,
        ).length;
        return (
          <CategoryRow
            key={cat.slug}
            category={cat}
            isSelected={i === selected}
            completedCount={completed}
          />
        );
      })}
    </div>
  );
}

function CategoryRow({
  category,
  isSelected,
  completedCount,
}: {
  category: CategoryMeta;
  isSelected: boolean;
  completedCount: number;
}) {
  const hasProgress = completedCount > 0;
  const allDone = completedCount === category.lessonCount;

  return (
    <Link
      to="/categories/$slug"
      params={{ slug: category.slug }}
      className={`group block rounded-lg px-3 py-2 text-sm transition-colors ${
        isSelected
          ? "bg-brand-bg text-brand"
          : "text-secondary hover:text-primary hover:bg-surface-hover"
      }`}
    >
      {/* Desktop */}
      <div className="hidden sm:grid grid-cols-[1rem_12rem_1.5rem_1fr_auto] items-baseline gap-x-2">
        <span
          className={isSelected ? "text-brand" : "text-subtle"}
        >
          {isSelected ? "›" : " "}
        </span>
        <span
          className={`truncate font-medium ${isSelected ? "text-brand" : "text-primary"}`}
        >
          {category.name}
        </span>
        <span className="text-subtle">—</span>
        <span className="text-xs text-muted truncate">
          {category.lessonTitles.join(", ")}
        </span>
        <span className="text-xs whitespace-nowrap pl-2">
          {hasProgress ? (
            <span className={allDone ? "text-brand font-medium" : "text-muted"}>
              {completedCount}/{category.lessonCount}
            </span>
          ) : (
            <span className="text-muted">
              {category.lessonCount} lesson{category.lessonCount !== 1 && "s"}
            </span>
          )}
        </span>
      </div>
      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2">
          <span
            className={`w-4 shrink-0 ${isSelected ? "text-brand" : "text-subtle"}`}
          >
            {isSelected ? "›" : " "}
          </span>
          <span className={`font-medium ${isSelected ? "text-brand" : "text-primary"}`}>
            {category.name}
          </span>
          <span className="ml-auto text-xs shrink-0">
            {hasProgress ? (
              <span className={allDone ? "text-brand font-medium" : "text-muted"}>
                {completedCount}/{category.lessonCount}
              </span>
            ) : (
              <span className="text-muted">
                {category.lessonCount} lesson{category.lessonCount !== 1 && "s"}
              </span>
            )}
          </span>
        </div>
        <div className="ml-6 mt-1 text-xs text-muted truncate">
          {category.lessonTitles.join(", ")}
        </div>
      </div>
    </Link>
  );
}
