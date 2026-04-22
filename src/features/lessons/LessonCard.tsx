import { Link } from "@tanstack/react-router";
import type { LessonMeta } from "./schema";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  JavaScript: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h18v18H3V3zm4.73 15.04c.4.85 1.19 1.55 2.54 1.55 1.5 0 2.53-.77 2.53-2.55v-5.78h-1.7v5.74c0 .86-.35 1.08-.9 1.08-.58 0-.82-.4-1.09-.87l-1.38.83zm5.98-.18c.5.98 1.51 1.73 3.09 1.73 1.6 0 2.8-.83 2.8-2.36 0-1.41-.81-2.04-2.25-2.66l-.42-.18c-.73-.31-1.04-.52-1.04-1.02 0-.41.31-.73.81-.73.48 0 .8.21 1.09.73l1.31-.87c-.55-.96-1.33-1.33-2.4-1.33-1.51 0-2.48.96-2.48 2.23 0 1.38.81 2.03 2.03 2.55l.42.18c.78.34 1.24.55 1.24 1.13 0 .48-.45.83-1.15.83-.83 0-1.31-.43-1.67-1.03l-1.38.8z" />
    </svg>
  ),
  "AI Tools": (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2a4 4 0 014 4v1a4 4 0 01-8 0V6a4 4 0 014-4z" />
      <path d="M8 14h8a4 4 0 014 4v2H4v-2a4 4 0 014-4z" />
      <circle cx="9" cy="6" r="0.5" fill="currentColor" />
      <circle cx="15" cy="6" r="0.5" fill="currentColor" />
    </svg>
  ),
};

function CategoryIcon({ category }: { category: string }) {
  const icon = CATEGORY_ICONS[category];
  if (!icon) return null;
  return <span className="text-brand">{icon}</span>;
}

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
  const progressPercent = completed
    ? 100
    : isInProgress
      ? Math.round(((currentStep ?? 0) / lesson.stepCount) * 100)
      : 0;

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
      {/* Top: category + stats */}
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-subtle px-2.5 py-0.5 text-[10px] font-medium text-muted">
          <CategoryIcon category={lesson.category} />
          {lesson.category.toUpperCase()}
        </span>
        <span className="text-[10px] text-muted">
          {lesson.stepCount} steps{lesson.quizCount > 0 && ` · ${lesson.quizCount} quiz${lesson.quizCount !== 1 ? "zes" : ""}`}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-primary group-hover:text-brand transition-colors">
        {lesson.title}
      </h3>

      {/* Description */}
      {lesson.description && (
        <p className="mt-1.5 text-xs text-muted leading-relaxed line-clamp-2">
          {lesson.description}
        </p>
      )}

      {/* Progress bar */}
      {(isInProgress || completed) && (
        <div className="mt-3 h-1 w-full rounded-full bg-border">
          <div
            className="h-1 rounded-full bg-brand transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 flex items-center justify-between text-xs">
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
