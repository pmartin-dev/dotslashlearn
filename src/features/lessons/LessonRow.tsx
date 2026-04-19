import { Link } from "@tanstack/react-router";
import type { LessonMeta } from "./schema";

export function LessonRow({
  lesson,
  isSelected,
  completed,
}: {
  lesson: LessonMeta;
  isSelected: boolean;
  completed: boolean;
}) {
  if (lesson.draft) {
    return (
      <div className="rounded px-3 py-2 font-mono text-sm opacity-40">
        {/* Desktop */}
        <div className="hidden sm:grid grid-cols-[1rem_12rem_1.5rem_1fr_auto] items-baseline gap-x-2">
          <span className="text-charcoal"> </span>
          <span className="text-slate-steel line-through truncate">
            {lesson.title}
          </span>
          <span className="text-charcoal">--</span>
          <span className="text-xs text-slate-steel italic truncate">
            coming soon
          </span>
          <span />
        </div>
        {/* Mobile */}
        <div className="sm:hidden">
          <div className="flex items-center gap-2">
            <span className="w-4 text-charcoal"> </span>
            <span className="text-slate-steel line-through">
              {lesson.title}
            </span>
          </div>
          <div className="ml-6 mt-1 text-xs text-slate-steel italic">
            coming soon
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to="/lessons/$slug"
      params={{ slug: lesson.slug }}
      className={`group block rounded px-3 py-2 font-mono text-sm transition-colors ${
        isSelected
          ? "bg-emerald-signal/10 text-emerald-signal"
          : "text-parchment hover:text-snow"
      }`}
    >
      {/* Desktop */}
      <div className="hidden sm:grid grid-cols-[1rem_12rem_1.5rem_1fr_auto] items-baseline gap-x-2">
        <span
          className={isSelected ? "text-emerald-signal" : "text-charcoal"}
        >
          {isSelected ? ">" : " "}
        </span>
        <span
          className={`truncate ${isSelected ? "text-emerald-signal" : "text-snow"}`}
        >
          {lesson.title}
        </span>
        <span className="text-charcoal">--</span>
        <span className="text-xs text-slate-steel truncate">
          {lesson.description}
        </span>
        <span className="text-xs whitespace-nowrap pl-2">
          {completed ? (
            <span className="text-emerald-signal">done</span>
          ) : (
            <span className="text-charcoal">{lesson.stepCount} steps</span>
          )}
        </span>
      </div>
      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2">
          <span
            className={`w-4 shrink-0 ${isSelected ? "text-emerald-signal" : "text-charcoal"}`}
          >
            {isSelected ? ">" : " "}
          </span>
          <span
            className={isSelected ? "text-emerald-signal" : "text-snow"}
          >
            {lesson.title}
          </span>
          <span className="ml-auto text-xs shrink-0">
            {completed ? (
              <span className="text-emerald-signal">done</span>
            ) : (
              <span className="text-charcoal">{lesson.stepCount} steps</span>
            )}
          </span>
        </div>
        <div className="ml-6 mt-1 text-xs text-slate-steel">
          {lesson.description}
        </div>
      </div>
    </Link>
  );
}
