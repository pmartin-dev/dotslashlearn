import { Link } from "@tanstack/react-router";
import type { LessonMeta } from "./schema";

function toHexId(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return `0x${(Math.abs(hash) % 0xffff).toString(16).toUpperCase().padStart(4, "0")}`;
}

function formatTitle(title: string): string {
  return `${title.toUpperCase().replace(/\s+/g, "_")}.md`;
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
  const hexId = toHexId(lesson.slug);

  if (lesson.draft) {
    return (
      <div className="flex flex-col rounded-lg border border-charcoal/50 bg-carbon p-5 font-mono opacity-40">
        <div className="mb-3">
          <span className="inline-block rounded border border-charcoal px-2 py-0.5 text-[10px] text-slate-steel">
            ID: {hexId}
          </span>
        </div>
        <h3 className="text-sm font-bold text-slate-steel line-through">
          {formatTitle(lesson.title)}
        </h3>
        <div className="mt-auto pt-6 flex items-center justify-between border-t border-charcoal/50 text-xs text-slate-steel">
          <span className="italic">coming soon</span>
        </div>
      </div>
    );
  }

  return (
    <Link
      to="/lessons/$slug"
      params={{ slug: lesson.slug }}
      className={`group flex flex-col rounded-lg border p-5 font-mono cursor-pointer transition-colors ${
        isSelected
          ? "border-emerald-signal bg-emerald-signal/5"
          : "border-charcoal bg-carbon hover:border-slate-steel"
      }`}
    >
      {/* Top: ID badge + category */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`inline-block rounded border px-2 py-0.5 text-[10px] ${
            isInProgress
              ? "border-emerald-signal/40 text-emerald-signal"
              : "border-charcoal text-slate-steel"
          }`}
        >
          ID: {hexId}
          {isInProgress && " (ACTIVE)"}
        </span>
        <span className="text-[10px] text-charcoal uppercase">
          {lesson.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-snow group-hover:text-emerald-signal transition-colors">
        {formatTitle(lesson.title)}
      </h3>

      {/* Meta fields */}
      <div className="mt-4 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className={isInProgress ? "text-emerald-signal" : "text-slate-steel"}>
            STEPS:
          </span>
          <span className="text-snow">{String(lesson.stepCount).padStart(2, "0")}</span>
        </div>
        <div className="flex justify-between">
          <span className={isInProgress ? "text-emerald-signal" : "text-slate-steel"}>
            CATEGORY:
          </span>
          <span className="text-snow uppercase">{lesson.category}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-5 flex items-center justify-between border-t border-charcoal/50 text-xs">
        {completed ? (
          <>
            <span className="text-emerald-signal">COMPLETED</span>
            <span className="text-emerald-signal">[REVIEW]</span>
          </>
        ) : isInProgress ? (
          <>
            <span className="text-emerald-signal">
              STEP {currentStep}/{lesson.stepCount}...
            </span>
            <span className="text-emerald-signal">[RESUME]</span>
          </>
        ) : (
          <>
            <span className="text-slate-steel">READY</span>
            <span className="text-emerald-signal group-hover:text-volt-mint transition-colors">
              [LAUNCH]
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
