import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

interface QuizOption {
  text: string;
  correct: boolean;
}

interface QuizData {
  question: string;
  options: QuizOption[];
  explanation: string;
}

function parseQuizContent(raw: string): QuizData {
  const lines = raw.trim().split("\n");
  const question: string[] = [];
  const options: QuizOption[] = [];
  let explanation = "";
  let section: "question" | "options" | "explanation" = "question";

  for (const line of lines) {
    if (line.startsWith("- [x] ") || line.startsWith("- [ ] ")) {
      section = "options";
      options.push({
        text: line.slice(6),
        correct: line.startsWith("- [x] "),
      });
    } else if (line.startsWith("explanation:")) {
      section = "explanation";
      explanation = line.slice("explanation:".length).trim();
    } else if (section === "explanation") {
      explanation += " " + line.trim();
    } else if (section === "question") {
      question.push(line);
    }
  }

  return { question: question.join("\n").trim(), options, explanation: explanation.trim() };
}

export function QuizBlock({ children }: { children: string }) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const quiz = parseQuizContent(children);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const canAdvance = !submitted;

  const submit = useCallback(() => {
    if (selected !== null && !submitted) {
      setSubmitted(true);
    }
  }, [selected, submitted]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleAdvance() {
      if (selected !== null && !submitted) {
        setSubmitted(true);
      }
    }

    el.addEventListener("terminal:advance", handleAdvance);
    return () => el.removeEventListener("terminal:advance", handleAdvance);
  }, [selected, submitted]);

  const isCorrect = selected !== null && quiz.options[selected]?.correct;

  return (
    <div
      ref={containerRef}
      className="quiz-block"
      data-can-advance={canAdvance || undefined}
    >
      <div className="quiz-block-header">
        <span className="quiz-block-title">quiz</span>
      </div>
      <div className="quiz-block-body">
        <p className="quiz-question">{quiz.question}</p>

        <div className="quiz-options">
          {quiz.options.map((option, i) => {
            let state: "idle" | "selected" | "correct" | "wrong" = "idle";
            if (submitted) {
              if (option.correct) state = "correct";
              else if (i === selected) state = "wrong";
            } else if (i === selected) {
              state = "selected";
            }

            return (
              <button
                key={i}
                type="button"
                className={`quiz-option quiz-option-${state}`}
                onClick={() => {
                  if (!submitted) setSelected(i);
                }}
                disabled={submitted}
              >
                <span className="quiz-option-marker">
                  {state === "correct" ? "✓" : state === "wrong" ? "✗" : String.fromCharCode(65 + i)}
                </span>
                <span>{option.text}</span>
              </button>
            );
          })}
        </div>

        {!submitted && selected !== null && (
          <button type="button" className="quiz-submit" onClick={submit}>
            Valider
          </button>
        )}

        {submitted && (
          <motion.div
            className={`quiz-feedback ${isCorrect ? "quiz-feedback-correct" : "quiz-feedback-wrong"}`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
          >
            <p className="quiz-feedback-title">
              {isCorrect ? "Correct !" : "Pas tout à fait."}
            </p>
            {quiz.explanation && (
              <p className="quiz-feedback-explanation">{quiz.explanation}</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
