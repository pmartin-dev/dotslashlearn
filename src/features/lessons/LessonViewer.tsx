import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, useReducedMotion } from "motion/react";
import type { Lesson } from "./schema";
import { progressStore } from "@/features/progress/store";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { CodeBlock } from "./CodeBlock";
import { useZoneKeyboard } from "@/shared/hooks/useKeyZone";

const markdownComponents = {
  pre({ children }: { children?: React.ReactNode }) {
    const child = Array.isArray(children) ? children[0] : children;
    if (
      child &&
      typeof child === "object" &&
      "type" in child &&
      child.type === "code"
    ) {
      const { className, children: codeChildren } = child.props;
      return (
        <CodeBlock className={className}>
          {codeChildren}
        </CodeBlock>
      );
    }
    return <pre>{children}</pre>;
  },
};

type LessonViewerProps = Pick<Lesson, "slug" | "title" | "steps" | "category">;

export function LessonViewer({ slug, title, steps, category }: LessonViewerProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const total = steps.length;
  const stepRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const [currentStep, setCurrentStep] = useState(() => {
    const saved = progressStore.get(slug);
    if (saved.currentStep > 0 && saved.currentStep < total && !saved.completed) {
      return saved.currentStep;
    }
    return 0;
  });
  const [highestStep, setHighestStep] = useState(currentStep);
  const isComplete = currentStep === total - 1;

  useEffect(() => {
    progressStore.saveStep(slug, currentStep);
  }, [slug, currentStep]);

  useEffect(() => {
    const el = stepRefs.current.get(currentStep);
    el?.scrollIntoView({
      behavior: prefersReducedMotion ? "instant" : "smooth",
      block: "center",
    });
  }, [currentStep, prefersReducedMotion]);

  const goNext = useCallback(() => {
    const stepEl = stepRefs.current.get(currentStep);
    if (stepEl) {
      const terminals = stepEl.querySelectorAll<HTMLElement>('[data-can-advance="true"]');
      for (const terminal of terminals) {
        if (terminal.dataset.canAdvance === "true") {
          terminal.dispatchEvent(new CustomEvent("terminal:advance"));
          return;
        }
      }
    }

    if (isComplete) {
      progressStore.complete(slug);
      navigate({ to: "/learn" });
    } else {
      setCurrentStep((s) => {
        const next = s + 1;
        setHighestStep((h) => Math.max(h, next));
        return next;
      });
    }
  }, [isComplete, navigate, slug, currentStep]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const handlers = useMemo(
    () => ({
      Enter: (e: KeyboardEvent) => { e.preventDefault(); goNext(); },
      ArrowRight: (e: KeyboardEvent) => { e.preventDefault(); goNext(); },
      ArrowLeft: (e: KeyboardEvent) => { e.preventDefault(); goPrev(); },
      Escape: (e: KeyboardEvent) => { e.preventDefault(); navigate({ to: "/learn" }); },
    }),
    [goNext, goPrev, navigate],
  );

  useZoneKeyboard("content", handlers);

  return (
    <div className="flex h-full flex-col">
      {/* Top bar: lesson info */}
      <div className="sticky top-0 z-10 shrink-0 border-b border-charcoal/50 bg-carbon px-4 sm:px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs sm:text-sm min-w-0">
            <Link
              to="/learn"
              className="shrink-0 text-slate-steel hover:text-emerald-signal transition-colors"
            >
              ~
            </Link>
            <span className="shrink-0 text-charcoal">/</span>
            <span className="shrink-0 text-slate-steel">
              {category}
            </span>
            <span className="shrink-0 text-charcoal">/</span>
            <span className="text-emerald-signal truncate">{title}</span>
          </div>
          <span className="shrink-0 font-mono text-xs text-slate-steel ml-2">
            [{currentStep + 1}/{total}]
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-px w-full bg-charcoal/30">
          <motion.div
            className="h-full bg-emerald-signal"
            initial={false}
            animate={{ width: `${((currentStep + 1) / total) * 100}%` }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Steps content — all visited steps stacked */}
      <div
        className="flex-1 overflow-y-auto sm:cursor-default cursor-pointer"
        onClick={(e) => {
          if (window.innerWidth < 640 && !isComplete && !(e.target as HTMLElement).closest("a")) {
            goNext();
          }
        }}
      >
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <div className="h-[40vh]" />
          {steps.slice(0, highestStep + 1).map((step, i) => (
            <motion.div
              key={i}
              ref={(el) => {
                if (el) stepRefs.current.set(i, el);
                else stepRefs.current.delete(i);
              }}
              initial={prefersReducedMotion || i <= highestStep - 1 ? false : { opacity: 0, y: 30 }}
              animate={{
                opacity: i <= currentStep ? 1 : 0.15,
                y: 0,
              }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="py-16 prose-terminal"
            >
              <ErrorBoundary>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {step}
                </ReactMarkdown>
              </ErrorBoundary>
              {i < currentStep && (
                <div className="mt-16 border-b border-charcoal/20" />
              )}
            </motion.div>
          ))}
          <div className="h-[40vh]" />
        </div>
      </div>

      {/* Bottom bar: keyboard hints */}
      <div className="shrink-0 border-t border-charcoal/50 bg-carbon">
        <div className="flex items-center justify-between px-6 py-3 font-mono text-xs text-slate-steel">
          {isComplete ? (
            <>
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
                to="/learn"
                className="text-slate-steel hover:text-emerald-signal transition-colors"
              >
                cd ~
              </Link>
            </>
          ) : (
            <>
              <span className="sm:hidden">tap to continue</span>
              <span className="hidden sm:flex items-center gap-3 ml-auto">
                <span>
                  <kbd className="rounded border border-charcoal bg-abyss px-1.5 py-0.5">→</kbd> next
                </span>
                <span>
                  <kbd className="rounded border border-charcoal bg-abyss px-1.5 py-0.5">←</kbd> prev
                </span>
                <span>
                  <kbd className="rounded border border-charcoal bg-abyss px-1.5 py-0.5">esc</kbd> quit
                </span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
