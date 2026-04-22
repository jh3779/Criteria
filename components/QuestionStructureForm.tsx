"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ComparisonGrid } from "@/components/ComparisonGrid";
import { StructureCard } from "@/components/StructureCard";
import { TradeoffLedger } from "@/components/TradeoffLedger";
import type { Locale } from "@/lib/i18n";
import type { StructuredApiError, StructuredThinking } from "@/lib/types";

type ApiResponse = Partial<StructuredApiError> & {
  data?: StructuredThinking;
  logId?: string | null;
};

type Props = {
  locale: Locale;
  initialQuestion?: string;
};

type Copy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  helper: string;
  guideLines: string[];
  questionLabel: string;
  placeholder: string;
  loading: string;
  submit: string;
  logSaved: string;
  focusOn: string;
  focusOff: string;
  fallbackError: string;
  unexpectedError: string;
  steps: {
    problem: string;
    condition: string;
    perspective: string;
    tradeoff: string;
    criteria: string;
    conclusion: string;
  };
  conditionColumns: {
    variable: string;
    signal: string;
    implication: string;
  };
  criteriaPrompt: string;
  focusTitle: string;
  close: string;
};

function getCopy(locale: Locale): Copy {
  if (locale === "ko") {
    return {
      eyebrow: "생각 입력",
      title: "입력",
      subtitle: "질문을 정답으로 끝내지 않고, 판단 구조로 분해합니다.",
      helper: "AI는 정답을 주지 않습니다. 조건, 관점, 트레이드오프, 기준을 순서대로 정리합니다.",
      guideLines: [
        "정답이 아니라 기준을 제공합니다",
        "이건 하나의 관점일 뿐입니다",
        "상황에 따라 다르게 해석될 수 있습니다"
      ],
      questionLabel: "질문 입력",
      placeholder: "예: 지금 이 프로젝트를 확장할지, 안정화에 집중할지 어떻게 판단해야 할까?",
      loading: "구조화 중...",
      submit: "사고 구조 생성",
      logSaved: "AI 로그 저장됨",
      focusOn: "집중 모드",
      focusOff: "집중 모드 종료",
      fallbackError: "질문 구조화에 실패했습니다.",
      unexpectedError: "예상치 못한 오류가 발생했습니다.",
      steps: {
        problem: "1. 문제 정의",
        condition: "2. 조건 분리",
        perspective: "3. 관점 비교",
        tradeoff: "4. 트레이드오프",
        criteria: "5. 판단 기준",
        conclusion: "6. 결론"
      },
      conditionColumns: {
        variable: "변수",
        signal: "관찰 신호",
        implication: "판단 영향"
      },
      criteriaPrompt: "아래 3가지 질문에 스스로 답할 수 있어야 결정을 내릴 수 있습니다.",
      focusTitle: "Focus Mode",
      close: "닫기"
    };
  }

  return {
    eyebrow: "Thinking Input",
    title: "Input",
    subtitle: "Turn a question into a decision framework instead of a one-line answer.",
    helper: "The model will not recommend a choice. It will structure conditions, perspectives, trade-offs, and criteria.",
    guideLines: [
      "We provide criteria, not final answers.",
      "This is only one possible perspective.",
      "Interpretation can change by context."
    ],
    questionLabel: "Your Question",
    placeholder: "Example: Should I scale this project now, or stabilize fundamentals first?",
    loading: "Structuring...",
    submit: "Build Criteria",
    logSaved: "AI log saved",
    focusOn: "Focus Mode",
    focusOff: "Exit Focus",
    fallbackError: "Failed to structure the question.",
    unexpectedError: "Unexpected error.",
    steps: {
      problem: "1. Problem Definition",
      condition: "2. Condition Isolation",
      perspective: "3. Perspective Comparison",
      tradeoff: "4. Trade-offs: Price of Choice",
      criteria: "5. Decision Criteria",
      conclusion: "6. Conclusion"
    },
    conditionColumns: {
      variable: "Variable",
      signal: "Signal to Watch",
      implication: "Implication"
    },
    criteriaPrompt: "A decision is ready only when you can answer these 3 questions clearly.",
    focusTitle: "Focus Mode",
    close: "Close"
  };
}

type ResultFlowProps = {
  copy: Copy;
  locale: Locale;
  result: StructuredThinking;
  motionKey: number;
};

function ResultFlow({ copy, locale, result, motionKey }: ResultFlowProps) {
  const transition = { duration: 0.34, ease: "easeOut" as const };

  return (
    <div key={motionKey} className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0 }}
      >
        <StructureCard step={copy.steps.problem} title={copy.steps.problem}>
          <p className="content-serif text-[17px] leading-8">{result.problem_definition}</p>
        </StructureCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.12 }}
      >
        <StructureCard step={copy.steps.condition} title={copy.steps.condition}>
          <div className="overflow-x-auto rounded-md border border-[var(--border)]">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead className="bg-[var(--surface-muted)] text-left">
                <tr>
                  <th className="border-b border-[var(--border)] px-4 py-3 font-semibold">
                    {copy.conditionColumns.variable}
                  </th>
                  <th className="border-b border-[var(--border)] px-4 py-3 font-semibold">
                    {copy.conditionColumns.signal}
                  </th>
                  <th className="border-b border-[var(--border)] px-4 py-3 font-semibold">
                    {copy.conditionColumns.implication}
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.condition_isolation.map((item) => (
                  <tr key={`${item.variable}-${item.signal}`}>
                    <td className="border-b border-[var(--border)] px-4 py-3 align-top">{item.variable}</td>
                    <td className="border-b border-[var(--border)] px-4 py-3 align-top">{item.signal}</td>
                    <td className="border-b border-[var(--border)] px-4 py-3 align-top">{item.implication}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StructureCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.24 }}
      >
        <StructureCard step={copy.steps.perspective} title={copy.steps.perspective}>
          <ComparisonGrid locale={locale} perspectives={result.perspective_comparison} />
        </StructureCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.36 }}
      >
        <StructureCard step={copy.steps.tradeoff} title={copy.steps.tradeoff}>
          <TradeoffLedger locale={locale} tradeoffs={result.tradeoffs} />
        </StructureCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.48 }}
      >
        <StructureCard step={copy.steps.criteria} title={copy.steps.criteria} helper={copy.criteriaPrompt}>
          <ol className="list-decimal space-y-2 pl-5">
            {result.decision_criteria.map((criterion) => (
              <li key={criterion} className="content-serif text-[17px] leading-8">
                {criterion}
              </li>
            ))}
          </ol>
        </StructureCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.6 }}
      >
        <StructureCard step={copy.steps.conclusion} title={copy.steps.conclusion}>
          <p className="content-serif text-[17px] leading-8">{result.conclusion}</p>
        </StructureCard>
      </motion.div>
    </div>
  );
}

export function QuestionStructureForm({ locale, initialQuestion = "" }: Props) {
  const copy = getCopy(locale);
  const [question, setQuestion] = useState(initialQuestion);
  const [result, setResult] = useState<StructuredThinking | null>(null);
  const [logId, setLogId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [motionKey, setMotionKey] = useState(0);

  useEffect(() => {
    if (!focusMode) {
      return;
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFocusMode(false);
      }
    }

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [focusMode]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, locale })
      });

      const payload = (await response.json()) as ApiResponse;
      if (!response.ok) {
        const baseError = payload.error ?? copy.fallbackError;
        if (payload.code === "STRUCTURE_RULE_VIOLATION" && payload.violations?.length) {
          const details = payload.violations.map((violation) => `- ${violation}`).join("\n");
          throw new Error(`${baseError}\n${details}`);
        }

        throw new Error(baseError);
      }

      if (!payload.data) {
        throw new Error(copy.fallbackError);
      }

      setResult(payload.data);
      setLogId(payload.logId ?? null);
      setMotionKey((prev) => prev + 1);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : copy.unexpectedError);
      setResult(null);
      setLogId(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="paper-card p-5 md:p-8">
        <div className="mb-6">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">{copy.title}</h2>
          <p className="mt-2 text-base text-[var(--muted)]">{copy.subtitle}</p>
          <p className="mt-3 text-sm text-[var(--muted-strong)]">{copy.helper}</p>
          <ul className="microcopy-list mt-3 space-y-1">
            {copy.guideLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="question">{copy.questionLabel}</label>
          <textarea
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={copy.placeholder}
            rows={5}
            required
            minLength={8}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button disabled={loading} type="submit" className="primary-btn">
              {loading ? copy.loading : copy.submit}
            </button>
            {result ? (
              <button
                className="secondary-btn"
                onClick={() => setFocusMode((prev) => !prev)}
                type="button"
              >
                {focusMode ? copy.focusOff : copy.focusOn}
              </button>
            ) : null}
            {logId ? <span className="text-xs text-[var(--accent-ink)]">{copy.logSaved}</span> : null}
          </div>
        </form>

        {error ? <p className="mt-4 whitespace-pre-line text-sm text-[var(--danger)]">{error}</p> : null}
      </section>

      {result ? (
        <section className="mt-6">
          <ResultFlow copy={copy} locale={locale} motionKey={motionKey} result={result} />
        </section>
      ) : null}

      {focusMode && result ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg)] px-4 py-5 md:px-8 md:py-8">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between border-b border-[var(--border)] pb-4">
            <h3 className="text-lg font-semibold tracking-tight text-[var(--text)]">{copy.focusTitle}</h3>
            <button className="secondary-btn" onClick={() => setFocusMode(false)} type="button">
              {copy.close}
            </button>
          </div>
          <div className="mx-auto mt-5 w-full max-w-5xl">
            <ResultFlow copy={copy} locale={locale} motionKey={motionKey} result={result} />
          </div>
        </div>
      ) : null}
    </>
  );
}
