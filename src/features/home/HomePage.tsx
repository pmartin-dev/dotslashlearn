import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { LessonMeta } from "@/features/lessons/schema";
import { useZoneKeyboard } from "@/shared/hooks/useKeyZone";

function pickRandom(lessons: LessonMeta[]): LessonMeta | null {
  if (lessons.length === 0) return null;
  return lessons[Math.floor(Math.random() * lessons.length)];
}

export function HomePage({ lessons }: { lessons: LessonMeta[] }) {
  const navigate = useNavigate();
  const nonDraft = useMemo(() => lessons.filter((l) => !l.draft), [lessons]);
  const latest = nonDraft.length > 0 ? nonDraft[nonDraft.length - 1] : null;
  const [random] = useState(() => pickRandom(nonDraft));

  const [focused, setFocused] = useState(0);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const cards = useMemo(
    () => [
      {
        tag: "BROWSE",
        title: "Browse All Lessons",
        subtitle: `${nonDraft.length} lesson${nonDraft.length !== 1 ? "s" : ""} available`,
        to: "/learn",
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        ),
      },
      {
        tag: "LATEST",
        title: latest?.title ?? "No lessons yet",
        subtitle: latest ? "Newest addition" : "",
        to: latest ? `/lessons/${latest.slug}` : "/learn",
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        ),
      },
      {
        tag: "RANDOM",
        title: random?.title ?? "No lessons yet",
        subtitle: random ? "Feeling lucky? Jump in." : "",
        to: random ? `/lessons/${random.slug}` : "/learn",
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        ),
      },
    ],
    [nonDraft.length, latest, random],
  );

  const handlers = useMemo(
    () => ({
      ArrowRight: (e: KeyboardEvent) => {
        e.preventDefault();
        setFocused((prev) => Math.min(prev + 1, cards.length - 1));
      },
      ArrowLeft: (e: KeyboardEvent) => {
        e.preventDefault();
        setFocused((prev) => Math.max(prev - 1, 0));
      },
      Enter: (e: KeyboardEvent) => {
        e.preventDefault();
        setFocused((prev) => {
          navigate({ to: cards[prev].to });
          return prev;
        });
      },
    }),
    [cards, navigate],
  );

  useZoneKeyboard("content", handlers);

  useEffect(() => {
    cardRefs.current[focused]?.focus();
  }, [focused]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 pb-6">
        {/* Large branding */}
        <h1 className="font-display text-6xl sm:text-8xl lg:text-9xl font-bold tracking-tight select-none">
          <span className="text-brand">.</span>
          <span className="text-brand">/</span>
          <span className="font-light text-primary">learn</span>
        </h1>

        {/* Tagline */}
        <p className="mt-8 text-lg sm:text-xl text-secondary text-center max-w-md">
          Interactive lessons for developers. Keyboard-driven.
        </p>

        {/* Feature cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
          {cards.map((card, i) => (
            <Link
              key={card.tag}
              ref={(el) => { cardRefs.current[i] = el; }}
              to={card.to}
              onFocus={() => setFocused(i)}
              className={`group rounded-2xl border p-5 transition-all outline-none shadow-card ${
                focused === i
                  ? "border-brand/30 bg-brand-bg shadow-brand"
                  : "border-subtle bg-surface hover:border-brand/20 hover:shadow-card-hover"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-brand">{card.icon}</span>
                <span className="text-xs font-semibold text-brand uppercase tracking-wide">
                  {card.tag}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-primary leading-snug">
                {card.title}
              </h3>
              <p className="mt-1 text-xs text-muted">
                {card.subtitle}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-subtle bg-surface-dim">
        <div className="flex items-center justify-center px-6 py-3 text-xs text-muted">
          <span className="hidden sm:flex items-center gap-3">
            <span>
              <kbd className="rounded-md border border-subtle bg-surface px-1.5 py-0.5 text-[11px] font-mono">←→</kbd> select
            </span>
            <span>
              <kbd className="rounded-md border border-subtle bg-surface px-1.5 py-0.5 text-[11px] font-mono">enter</kbd> open
            </span>
            <span>
              <kbd className="rounded-md border border-subtle bg-surface px-1.5 py-0.5 text-[11px] font-mono">tab</kbd> sidebar
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
