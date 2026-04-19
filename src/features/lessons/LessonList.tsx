import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { LessonMeta } from "./schema";
import type { ProgressData } from "@/features/progress/store";
import { progressStore } from "@/features/progress/store";
import { LessonRow } from "./LessonRow";

export function LessonList({ lessons }: { lessons: LessonMeta[] }) {
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
    const lesson = lessons[selected];
    if (lesson.draft) return;
    navigate({ to: "/lessons/$slug", params: { slug: lesson.slug } });
  }, [navigate, lessons, selected]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setSelected((s) => {
          let next = s + 1;
          while (next < lessons.length && lessons[next].draft) next++;
          return next < lessons.length ? next : s;
        });
      }
      if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setSelected((s) => {
          let next = s - 1;
          while (next >= 0 && lessons[next].draft) next--;
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
  }, [lessons, open]);

  return (
    <div className="grid gap-1">
      {lessons.map((lesson, i) => (
        <LessonRow
          key={lesson.slug}
          lesson={lesson}
          isSelected={i === selected}
          completed={progress[lesson.slug]?.completed ?? false}
        />
      ))}
    </div>
  );
}
