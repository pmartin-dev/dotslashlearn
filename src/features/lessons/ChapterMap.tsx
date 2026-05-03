import { motion, useReducedMotion } from "motion/react";
import type { Chapter } from "./useChapters";
import { getChapterIndex } from "./useChapters";

interface ChapterMapProps {
  chapters: Chapter[];
  currentStep: number;
  highestStep: number;
  onNavigate: (step: number) => void;
}

export function ChapterMap({ chapters, currentStep, highestStep, onNavigate }: ChapterMapProps) {
  const prefersReducedMotion = useReducedMotion();
  const currentChapterIdx = getChapterIndex(chapters, currentStep);

  return (
    <div className="mt-2 flex gap-0.5 h-1 w-full">
      {chapters.map((chapter, i) => {
        const stepCount = chapter.endStep - chapter.startStep + 1;
        const visitedInChapter = Math.max(
          0,
          Math.min(highestStep - chapter.startStep + 1, stepCount),
        );
        const fillPct = (visitedInChapter / stepCount) * 100;
        const isActive = i === currentChapterIdx;
        const isAccessible = highestStep >= chapter.startStep;

        return (
          <button
            key={i}
            title={chapter.title}
            aria-label={`${chapter.title} (chapter ${i + 1} of ${chapters.length})`}
            aria-current={isActive ? "step" : undefined}
            disabled={!isAccessible}
            onClick={() => isAccessible && onNavigate(chapter.startStep)}
            className={`relative h-full rounded-full overflow-hidden min-w-0 transition-opacity ${
              isAccessible ? "cursor-pointer hover:opacity-80" : "cursor-default"
            } ${isActive ? "scale-y-[1.5] origin-center" : ""}`}
            style={{ flex: stepCount }}
          >
            <div className="absolute inset-0 bg-subtle rounded-full" />
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full ${
                isActive ? "bg-brand" : "bg-brand/40"
              }`}
              initial={false}
              animate={{ width: `${fillPct}%` }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeOut" }}
            />
          </button>
        );
      })}
    </div>
  );
}
