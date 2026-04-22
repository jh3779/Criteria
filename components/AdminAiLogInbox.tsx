"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCategoryLabel } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { ARTICLE_CATEGORIES, type AiLog } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

type Props = {
  initialLogs: AiLog[];
  locale: Locale;
  enabled: boolean;
};

type PromoteFormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: string;
};

function truncate(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function fallbackTitle(locale: Locale): string {
  return locale === "ko" ? "AI 구조화 노트" : "AI Structure Note";
}

function buildSlugCandidate(title: string): string {
  const base = slugify(title);
  if (base) {
    return base;
  }

  return `ai-log-${Date.now()}`;
}

function toLocalDatetimeValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function buildMarkdownContent(log: AiLog): string {
  const data = log.responseJson;
  const lines: string[] = [
    "## 1. Problem Definition",
    data.problem_definition,
    "",
    "## 2. Condition Isolation"
  ];

  for (const condition of data.condition_isolation) {
    lines.push(`- **${condition.variable}**`);
    lines.push(`  - Signal: ${condition.signal}`);
    lines.push(`  - Implication: ${condition.implication}`);
  }

  lines.push("", "## 3. Perspective Comparison");
  for (const perspective of data.perspective_comparison) {
    lines.push(`### ${perspective.name}`);
    lines.push(`- Core View: ${perspective.core_view}`);
    lines.push(`- Works Best When: ${perspective.when_it_works}`);
    lines.push(`- Blind Spot: ${perspective.blind_spot}`);
  }

  lines.push("", "## 4. Trade-offs");
  for (const tradeoff of data.tradeoffs) {
    lines.push(`- **Choice:** ${tradeoff.choice}`);
    lines.push(`  - Gain: ${tradeoff.gain}`);
    lines.push(`  - Price of Choice: ${tradeoff.price}`);
  }

  lines.push("", "## 5. Decision Criteria");
  for (const criterion of data.decision_criteria) {
    lines.push(`1. ${criterion}`);
  }

  lines.push("", "## 6. Conclusion", data.conclusion);
  return lines.join("\n");
}

function buildDefaultForm(log: AiLog, locale: Locale): PromoteFormState {
  const title = truncate(log.question, 90) || fallbackTitle(locale);
  return {
    title,
    slug: buildSlugCandidate(title),
    excerpt: truncate(log.responseJson.problem_definition, 220),
    content: buildMarkdownContent(log),
    category: "choice",
    publishedAt: toLocalDatetimeValue(new Date())
  };
}

export function AdminAiLogInbox({ initialLogs, locale, enabled }: Props) {
  const router = useRouter();
  const [logs, setLogs] = useState<AiLog[]>(initialLogs);
  const [selectedId, setSelectedId] = useState<string | null>(initialLogs[0]?.id ?? null);
  const [form, setForm] = useState<PromoteFormState | null>(
    initialLogs[0] ? buildDefaultForm(initialLogs[0], locale) : null
  );
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  useEffect(() => {
    if (!logs.find((log) => log.id === selectedId)) {
      setSelectedId(logs[0]?.id ?? null);
    }
  }, [logs, selectedId]);

  const selectedLog = useMemo(
    () => logs.find((log) => log.id === selectedId) ?? null,
    [logs, selectedId]
  );

  useEffect(() => {
    if (!selectedLog) {
      setForm(null);
      return;
    }

    setForm(buildDefaultForm(selectedLog, locale));
    setSlugTouched(false);
    setError(null);
    setNotice(null);
  }, [selectedLog, locale]);

  const copy =
    locale === "ko"
      ? {
          title: "AI 로그 인박스",
          description: "생성된 사고 구조를 검토하고 공개 포스트로 승격합니다.",
          disabled: "서비스 롤 키가 없어 AI 로그 인박스를 사용할 수 없습니다.",
          empty: "승격 대기 중인 AI 로그가 없습니다.",
          pickLog: "로그 선택",
          model: "모델",
          createdAt: "생성 시각",
          promoteTitle: "승격 폼",
          sourceQuestion: "원문 질문",
          titleField: "제목",
          slugField: "슬러그",
          excerptField: "요약",
          contentField: "본문",
          categoryField: "카테고리",
          publishedAtField: "게시 일시",
          promoting: "승격 중...",
          promote: "포스트로 승격",
          promoted: "승격 완료",
          unexpectedError: "예상치 못한 오류가 발생했습니다."
        }
      : {
          title: "AI Log Inbox",
          description: "Review generated thought maps and promote them into public posts.",
          disabled: "Service role key is missing. AI log inbox is unavailable.",
          empty: "No generated AI logs are waiting for promotion.",
          pickLog: "Select Log",
          model: "Model",
          createdAt: "Created At",
          promoteTitle: "Promotion Form",
          sourceQuestion: "Source Question",
          titleField: "Title",
          slugField: "Slug",
          excerptField: "Excerpt",
          contentField: "Content",
          categoryField: "Category",
          publishedAtField: "Published At",
          promoting: "Promoting...",
          promote: "Promote to Post",
          promoted: "Promoted successfully",
          unexpectedError: "Unexpected error."
        };

  async function promoteSelectedLog() {
    if (!selectedLog || !form) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/ai-logs/${selectedLog.id}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined
        })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? copy.unexpectedError);
      }

      setLogs((prev) => prev.filter((log) => log.id !== selectedLog.id));
      setNotice(copy.promoted);
      router.refresh();
    } catch (promoteError) {
      setError(promoteError instanceof Error ? promoteError.message : copy.unexpectedError);
    } finally {
      setSubmitting(false);
    }
  }

  if (!enabled) {
    return (
      <section className="paper-card p-4 md:p-5">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">{copy.title}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{copy.disabled}</p>
      </section>
    );
  }

  return (
    <section className="paper-card p-4 md:p-5">
      <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">{copy.title}</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">{copy.description}</p>

      {logs.length === 0 ? (
        <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--paper-soft)] p-4 text-sm text-[var(--muted)]">
          {copy.empty}
        </p>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{copy.pickLog}</p>
            <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
              {logs.map((log) => (
                <button
                  key={log.id}
                  className={`w-full rounded-md border px-3 py-2 text-left transition ${
                    log.id === selectedId
                      ? "border-[var(--accent-border)] bg-[var(--accent-soft)]"
                      : "border-[var(--border)] bg-[var(--paper-strong)] hover:border-[var(--accent-border)]"
                  }`}
                  onClick={() => setSelectedId(log.id)}
                  type="button"
                >
                  <p className="line-clamp-2 text-sm font-semibold text-[var(--text)]">{log.question}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {copy.model}: {log.model} · {log.locale.toUpperCase()}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {copy.createdAt}: {new Date(log.createdAt).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {selectedLog && form ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {copy.promoteTitle}
              </p>
              <div className="space-y-3 rounded-md border border-[var(--border)] bg-[var(--paper-strong)] p-4">
                <p className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--muted)]">
                  <span className="mr-1 font-semibold text-[var(--text)]">{copy.sourceQuestion}:</span>
                  {selectedLog.question}
                </p>

                <label>
                  {copy.titleField}
                  <input
                    value={form.title}
                    onChange={(event) => {
                      const nextTitle = event.target.value;
                      setForm((prev) => {
                        if (!prev) {
                          return prev;
                        }

                        const nextSlug = slugTouched ? prev.slug : buildSlugCandidate(nextTitle);
                        return { ...prev, title: nextTitle, slug: nextSlug };
                      });
                    }}
                  />
                </label>

                <label>
                  {copy.slugField}
                  <input
                    value={form.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      const value = event.target.value;
                      setForm((prev) => (prev ? { ...prev, slug: value } : prev));
                    }}
                  />
                </label>

                <label>
                  {copy.excerptField}
                  <textarea
                    rows={3}
                    value={form.excerpt}
                    onChange={(event) =>
                      setForm((prev) => (prev ? { ...prev, excerpt: event.target.value } : prev))
                    }
                  />
                </label>

                <label>
                  {copy.contentField}
                  <textarea
                    rows={14}
                    value={form.content}
                    onChange={(event) =>
                      setForm((prev) => (prev ? { ...prev, content: event.target.value } : prev))
                    }
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    {copy.categoryField}
                    <select
                      value={form.category}
                      onChange={(event) =>
                        setForm((prev) => (prev ? { ...prev, category: event.target.value } : prev))
                      }
                    >
                      {ARTICLE_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {getCategoryLabel(category, locale)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    {copy.publishedAtField}
                    <input
                      type="datetime-local"
                      value={form.publishedAt}
                      onChange={(event) =>
                        setForm((prev) => (prev ? { ...prev, publishedAt: event.target.value } : prev))
                      }
                    />
                  </label>
                </div>

                <button className="primary-btn" disabled={submitting} onClick={promoteSelectedLog} type="button">
                  {submitting ? copy.promoting : copy.promote}
                </button>

                {notice ? <p className="text-sm text-[var(--accent-ink)]">{notice}</p> : null}
                {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
