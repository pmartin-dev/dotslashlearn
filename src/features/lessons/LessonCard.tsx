import { Link } from "@tanstack/react-router";
import type { LessonMeta } from "./schema";

export function LessonCard({
  lesson,
  completed,
  currentStep,
  isSelected = false,
}: {
  lesson: LessonMeta;
  completed: boolean;
  currentStep?: number;
  isSelected?: boolean;
}) {
  const isInProgress = !completed && currentStep !== undefined && currentStep > 0;

  if (lesson.draft) {
    return (
      <div className="flex flex-col rounded-2xl border border-subtle bg-surface-dim p-5 opacity-40 shadow-card">
        <h3 className="text-sm font-semibold text-muted line-through">
          {lesson.title}
        </h3>
        <p className="mt-1 text-xs text-muted">{lesson.category}</p>
        <div className="mt-auto pt-5 flex items-center justify-between border-t border-subtle text-xs text-muted">
          <span className="italic">coming soon</span>
        </div>
      </div>
    );
  }

  return (
    <Link
      to="/lessons/$slug"
      params={{ slug: lesson.slug }}
      className={`group flex flex-col rounded-2xl border p-5 cursor-pointer transition-all shadow-card ${
        isSelected
          ? "border-brand/30 bg-brand-bg shadow-brand"
          : "border-subtle bg-surface hover:border-brand/20 hover:shadow-card-hover"
      }`}
    >
      {/* Top: category */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
            isInProgress
              ? "border-brand/30 text-brand bg-brand-bg"
              : "border-subtle text-muted"
          }`}
        >
          {isInProgress ? "IN PROGRESS" : lesson.category.toUpperCase()}
        </span>
        <span className="text-[10px] text-muted">
          {lesson.stepCount} steps
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-primary group-hover:text-brand transition-colors">
        {lesson.title}
      </h3>

      {/* Footer */}
      <div className="mt-auto pt-5 flex items-center justify-between border-t border-subtle text-xs">
        {completed ? (
          <>
            <span className="text-brand font-medium">Completed</span>
            <span className="text-brand">Review →</span>
          </>
        ) : isInProgress ? (
          <>
            <span className="text-brand">
              Step {currentStep}/{lesson.stepCount}
            </span>
            <span className="text-brand font-medium">Resume →</span>
          </>
        ) : (
          <>
            <span className="text-muted">Ready</span>
            <span className="text-brand group-hover:text-brand-hover transition-colors font-medium">
              Start →
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
