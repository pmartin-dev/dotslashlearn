import { motion, useReducedMotion } from "motion/react";
import type { Chapter } from "./useChapters";
import { getChapterIndex } from "./useChapters";

interface ChapterSidebarProps {
  chapters: Chapter[];
  currentStep: number;
  highestStep: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (step: number) => void;
}

const SIDEBAR_WIDTH = 280;

export function ChapterSidebar({
  chapters,
  currentStep,
  highestStep,
  open,
  onClose,
  onNavigate,
}: ChapterSidebarProps) {
  const prefersReducedMotion = useReducedMotion();
  const currentChapterIdx = getChapterIndex(chapters, currentStep);

  return (
    <motion.aside
      id="lesson-chapters"
      inert={!open}
      aria-hidden={!open}
      className="hidden sm:flex flex-col border-r border-subtle bg-surface-dim shrink-0 overflow-hidden"
      initial={false}
      animate={{ width: open ? SIDEBAR_WIDTH : 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex flex-col h-full" style={{ width: SIDEBAR_WIDTH }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-subtle shrink-0">
          <span className="text-xs font-mono text-muted tracking-widest uppercase">
            chapters
          </span>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary transition-colors text-sm leading-none"
            aria-label="Hide chapters"
            title="Hide (c)"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {chapters.map((chapter, i) => {
            const stepCount = chapter.endStep - chapter.startStep + 1;
            const isActive = i === currentChapterIdx;
            const isCompleted = highestStep > chapter.endStep;
            const isAccessible = highestStep >= chapter.startStep;

            return (
              <button
                key={i}
                disabled={!isAccessible}
                aria-current={isActive ? "step" : undefined}
                onClick={() => isAccessible && onNavigate(chapter.startStep)}
                className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-brand/10 text-brand"
                    : isAccessible
                      ? "hover:bg-surface-hover text-primary cursor-pointer"
                      : "text-muted/40 cursor-default"
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-xs w-3 shrink-0 text-center">
                    {isCompleted ? "✓" : isActive ? "▶" : "·"}
                  </span>
                  <span className="truncate">{chapter.title}</span>
                </span>
                <span className="text-xs font-mono text-muted shrink-0 ml-3">
                  {stepCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.aside>
  );
}
