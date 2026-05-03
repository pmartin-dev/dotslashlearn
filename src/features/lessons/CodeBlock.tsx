import type { HTMLAttributes, ReactNode } from "react";
import { TerminalBlock } from "./TerminalBlock";
import { QuizBlock } from "./QuizBlock";

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

function extractText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.filter((c): c is string => typeof c === "string").join("");
  }
  return "";
}

export function CodeBlock({
  codeClassName,
  codeChildren,
  preProps,
}: {
  codeClassName?: string;
  codeChildren?: ReactNode;
  preProps: HTMLAttributes<HTMLPreElement>;
}) {
  const lang = formatLang(codeClassName);

  if (lang === "terminal") {
    return <TerminalBlock>{extractText(codeChildren)}</TerminalBlock>;
  }

  if (lang === "quiz") {
    return <QuizBlock>{extractText(codeChildren)}</QuizBlock>;
  }

  return (
    <div className="code-block">
      {lang && (
        <div className="code-block-header">
          <span className="code-block-lang">{lang}</span>
        </div>
      )}
      <pre {...preProps}>
        <code className={codeClassName}>{codeChildren}</code>
      </pre>
    </div>
  );
}
