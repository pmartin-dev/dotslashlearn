import type { ReactNode } from "react";
import { TerminalBlock } from "./TerminalBlock";

const LANG_LABELS: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  jsx: "react",
  tsx: "react",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  py: "python",
  rb: "ruby",
  rs: "rust",
  yml: "yaml",
  md: "markdown",
};

function formatLang(className?: string): string | null {
  if (!className) return null;
  const match = className.match(/language-(\w+)/);
  if (!match) return null;
  const raw = match[1];
  return LANG_LABELS[raw] ?? raw;
}

export function CodeBlock({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const lang = formatLang(className);

  if (lang === "terminal") {
    const text =
      typeof children === "string"
        ? children
        : Array.isArray(children)
          ? children.filter((c): c is string => typeof c === "string").join("")
          : "";
    return <TerminalBlock>{text}</TerminalBlock>;
  }

  return (
    <div className="code-block">
      {lang && (
        <div className="code-block-header">
          <span className="code-block-lang">{lang}</span>
        </div>
      )}
      <pre>
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
