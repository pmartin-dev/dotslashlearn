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
        tagColor: "text-emerald-signal",
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
        tagColor: "text-volt-mint",
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
        tagColor: "text-traffic-yellow",
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
        <h1 className="font-mono text-6xl sm:text-8xl lg:text-9xl font-bold text-emerald-signal tracking-tight select-none">
          <span className="text-emerald-signal/60">.</span>/
          <span className="font-light">learn</span>
        </h1>

        {/* Prompt */}
        <div className="mt-8 font-mono text-2xl sm:text-3xl text-emerald-signal/80">
          $ <span className="cursor-blink">_</span>
        </div>

        {/* Tagline */}
        <p className="mt-6 font-mono text-xs sm:text-sm text-slate-steel tracking-widest text-center">
          INTERACTIVE LESSONS FOR DEVELOPERS. KEYBOARD-DRIVEN.
        </p>

        {/* Feature cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
          {cards.map((card, i) => (
            <Link
              key={card.tag}
              ref={(el) => { cardRefs.current[i] = el; }}
              to={card.to}
              onFocus={() => setFocused(i)}
              className={`group rounded-lg border p-5 transition-colors outline-none ${
                focused === i
                  ? "border-emerald-signal/40 bg-charcoal/20"
                  : "border-charcoal bg-carbon/80 hover:border-emerald-signal/30 hover:bg-charcoal/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={card.tagColor}>{card.icon}</span>
                <span className={`font-mono text-xs ${card.tagColor}`}>
                  {card.tag}
                </span>
              </div>
              <h3 className="font-mono text-sm font-semibold text-snow leading-snug">
                {card.title}
              </h3>
              <p className="mt-1 font-mono text-xs text-slate-steel">
                {card.subtitle}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-charcoal/50 bg-carbon">
        <div className="flex items-center justify-center px-6 py-3 font-mono text-xs text-slate-steel">
          <span className="hidden sm:flex items-center gap-3">
            <span>
              <kbd className="rounded border border-charcoal bg-abyss px-1.5 py-0.5">←→</kbd> select
            </span>
            <span>
              <kbd className="rounded border border-charcoal bg-abyss px-1.5 py-0.5">enter</kbd> open
            </span>
            <span>
              <kbd className="rounded border border-charcoal bg-abyss px-1.5 py-0.5">tab</kbd> sidebar
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
