import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Lesson } from "./schema";
import { toSlug } from "./schema";
import { progressStore } from "@/features/progress/store";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";

type LessonViewerProps = Pick<Lesson, "slug" | "title" | "steps" | "category">;

export function LessonViewer({ slug, title, steps, category }: LessonViewerProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const total = steps.length;

  // Restore progress from localStorage synchronously at mount.
  // This avoids a flash of step 0 before restoring the saved position.
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = progressStore.get(slug);
    if (saved.currentStep > 0 && saved.currentStep < total && !saved.completed) {
      return saved.currentStep;
    }
    return 0;
  });
  const [direction, setDirection] = useState(1);
  const isComplete = currentStep === total - 1;

  useEffect(() => {
    progressStore.saveStep(slug, currentStep);
  }, [slug, currentStep]);

  const goNext = useCallback(() => {
    if (isComplete) {
      progressStore.complete(slug);
      navigate({ to: "/" });
    } else {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }, [isComplete, navigate, slug]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        navigate({ to: "/" });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, navigate]);

  const animationProps = prefersReducedMotion
    ? { initial: false, animate: {}, exit: {}, transition: { duration: 0 } }
    : {
        initial: { y: direction * 60, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: direction * -60, opacity: 0 },
        transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
      };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar: lesson info */}
      <div className="shrink-0 border-b border-charcoal/50 px-4 sm:px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs sm:text-sm min-w-0">
            <Link
              to="/"
              className="shrink-0 text-slate-steel hover:text-emerald-signal transition-colors"
            >
              ~
            </Link>
            <span className="shrink-0 text-charcoal">/</span>
            <Link
              to="/categories/$slug"
              params={{ slug: toSlug(category) }}
              className="shrink-0 text-slate-steel hover:text-emerald-signal transition-colors"
            >
              {category}
            </Link>
            <span className="shrink-0 text-charcoal">/</span>
            <span className="text-emerald-signal truncate">{title}</span>
          </div>
          <span className="shrink-0 font-mono text-xs text-slate-steel ml-2">
            [{currentStep + 1}/{total}]
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-px w-full bg-charcoal/30">
        <motion.div
          className="h-full bg-emerald-signal"
          initial={false}
          animate={{ width: `${((currentStep + 1) / total) * 100}%` }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Step content */}
      <div className="relative flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            {...animationProps}
            className="flex min-h-full items-center"
          >
            <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 sm:py-0 prose-terminal">
              <ErrorBoundary>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {steps[currentStep]}
                </ReactMarkdown>
              </ErrorBoundary>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Terminal prompt */}
      <div className="shrink-0 border-t border-charcoal/50 bg-carbon">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-3">
          {isComplete ? (
            <div className="flex items-center justify-between font-mono text-xs sm:text-sm">
              <span>
                <span className="text-emerald-signal">~</span>
                <span className="text-slate-steel"> $ </span>
                <span className="text-emerald-signal">echo</span>
                <span className="text-parchment">
                  {" "}
                  &quot;lesson complete&quot;
                </span>
              </span>
              <Link
                to="/"
                className="text-slate-steel hover:text-emerald-signal transition-colors"
              >
                cd ~
              </Link>
            </div>
          ) : (
            <button
              onClick={goNext}
              className="group flex w-full items-center font-mono text-xs sm:text-sm"
            >
              <span className="text-emerald-signal">~</span>
              <span className="text-slate-steel"> $ </span>
              <span className="text-parchment group-hover:text-snow transition-colors">
                next
              </span>
              <span className="cursor-blink ml-0.5 text-emerald-signal">
                _
              </span>
              <span className="ml-auto text-xs text-charcoal group-hover:text-slate-steel transition-colors hidden sm:inline">
                press enter
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
