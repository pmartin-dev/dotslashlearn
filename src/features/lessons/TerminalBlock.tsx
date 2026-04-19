import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

interface TerminalEntry {
  command: string;
  output: string;
}

function parseTerminalContent(raw: string): TerminalEntry[] {
  const lines = raw.replace(/\n$/, "").split("\n");
  const entries: TerminalEntry[] = [];
  let current: TerminalEntry | null = null;

  for (const line of lines) {
    if (line.startsWith("$ ")) {
      if (current) entries.push(current);
      current = { command: line.slice(2), output: "" };
    } else {
      if (!current) current = { command: "", output: "" };
      current.output += (current.output ? "\n" : "") + line;
    }
  }
  if (current) entries.push(current);

  return entries;
}

export function TerminalBlock({ children }: { children: string }) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const entries = useMemo(() => parseTerminalContent(children), [children]);
  const [revealedCount, setRevealedCount] = useState(0);
  const canAdvance = revealedCount < entries.length;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleAdvance() {
      setRevealedCount((c) => c + 1);
    }

    el.addEventListener("terminal:advance", handleAdvance);
    return () => el.removeEventListener("terminal:advance", handleAdvance);
  }, []);

  const reset = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedCount(0);
  }, []);

  if (entries.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="terminal-block"
      data-can-advance={canAdvance || undefined}
    >
      <div className="terminal-block-header">
        <span className="terminal-block-title">terminal</span>
        {revealedCount > 0 && (
          <button type="button" className="terminal-reset-btn" onClick={reset}>
            reset
          </button>
        )}
      </div>
      <div className="terminal-block-body">
        {entries.map((entry, i) => {
          const isRevealed = i < revealedCount;
          const isVisible = i <= revealedCount;

          if (!isVisible) return null;

          return (
            <div key={i} className="terminal-entry">
              {entry.command && (
                <div className="terminal-command-line">
                  <span className="terminal-prompt">$ </span>
                  <span className="terminal-command">{entry.command}</span>
                  {!isRevealed && (
                    <span className="terminal-cursor" />
                  )}
                </div>
              )}

              {isRevealed && entry.output && (
                <motion.div
                  className="terminal-output"
                  initial={
                    prefersReducedMotion ? false : { opacity: 0, height: 0 }
                  }
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.25,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  {entry.output}
                </motion.div>
              )}
            </div>
          );
        })}

        {!canAdvance && (
          <div className="terminal-command-line terminal-done">
            <span className="terminal-prompt">$ </span>
            <span className="terminal-cursor" />
          </div>
        )}
      </div>
    </div>
  );
}
