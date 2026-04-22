"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ARTICLE_CATEGORIES } from "@/lib/types";
import { getCategoryLabel } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";
import type { Article } from "@/lib/types";

type Props = {
  initialArticles: Article[];
  locale: Locale;
};

type FormState = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: string;
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: ARTICLE_CATEGORIES[0],
  publishedAt: ""
};

export function AdminArticleManager({ initialArticles, locale }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const copy =
    locale === "ko"
      ? {
          saveFailed: "게시글 저장에 실패했습니다.",
          deleteConfirm: "이 게시글을 삭제할까요?",
          deleteFailed: "게시글 삭제에 실패했습니다.",
          unexpectedError: "예상치 못한 오류가 발생했습니다.",
          articles: "아티클",
          new: "새 글",
          noArticles: "아직 아티클이 없습니다.",
          edit: "수정",
          create: "작성",
          article: "아티클",
          title: "제목",
          slug: "슬러그",
          slugPlaceholder: "비워두면 제목으로 자동 생성",
          category: "카테고리",
          publishedAt: "게시 일시",
          excerpt: "요약",
          content: "본문 (Markdown 또는 일반 텍스트)",
          saving: "저장 중...",
          update: "업데이트",
          publish: "발행",
          delete: "삭제"
        }
      : {
          saveFailed: "Failed to save article",
          deleteConfirm: "Delete this article?",
          deleteFailed: "Failed to delete article",
          unexpectedError: "Unexpected error",
          articles: "Articles",
          new: "New",
          noArticles: "No articles yet.",
          edit: "Edit",
          create: "Create",
          article: "Article",
          title: "Title",
          slug: "Slug",
          slugPlaceholder: "optional-auto-from-title",
          category: "Category",
          publishedAt: "Published At",
          excerpt: "Excerpt",
          content: "Content (Markdown or plain text)",
          saving: "Saving...",
          update: "Update",
          publish: "Publish",
          delete: "Delete"
        };

  const sorted = useMemo(
    () => [...initialArticles].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1)),
    [initialArticles]
  );

  function pickArticle(article: Article) {
    setError(null);
    setForm({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      publishedAt: article.publishedAt.slice(0, 16)
    });
  }

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function saveArticle() {
    setSubmitting(true);
    setError(null);

    try {
      const method = form.id ? "PATCH" : "POST";
      const endpoint = form.id ? `/api/articles/${form.id}` : "/api/articles";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt,
          content: form.content,
          category: form.category,
          publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined
        })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? copy.saveFailed);
      }

      setForm(emptyForm);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : copy.unexpectedError);
    } finally {
      setSubmitting(false);
    }
  }

  async function removeArticle() {
    if (!form.id) {
      return;
    }

    if (!window.confirm(copy.deleteConfirm)) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/articles/${form.id}`, {
        method: "DELETE"
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? copy.deleteFailed);
      }

      setForm(emptyForm);
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : copy.unexpectedError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1.8fr]">
      <section className="paper-card p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">{copy.articles}</h2>
          <button
            className="secondary-btn"
            onClick={() => {
              setForm(emptyForm);
              setError(null);
            }}
            type="button"
          >
            {copy.new}
          </button>
        </div>
        <div className="max-h-[560px] space-y-2 overflow-auto pr-1">
          {sorted.map((article) => (
            <button
              key={article.id}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--paper-strong)] px-3 py-2 text-left hover:border-[var(--accent-border)]"
              onClick={() => pickArticle(article)}
              type="button"
            >
              <p className="font-semibold">{article.title}</p>
              <p className="text-xs text-[var(--muted)]">/{article.slug}</p>
            </button>
          ))}
          {sorted.length === 0 ? <p className="text-sm">{copy.noArticles}</p> : null}
        </div>
      </section>

      <section className="paper-card p-4 md:p-5">
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-[var(--text)]">
          {form.id ? copy.edit : copy.create} {copy.article}
        </h2>
        <div className="grid gap-3">
          <label>
            {copy.title}
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
            />
          </label>

          <label>
            {copy.slug}
            <input
              value={form.slug}
              onChange={(event) => updateField("slug", event.target.value)}
              placeholder={copy.slugPlaceholder}
            />
          </label>

          <label>
            {copy.category}
            <select
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
            >
              {ARTICLE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category, locale)}
                </option>
              ))}
            </select>
          </label>

          <label>
            {copy.publishedAt}
            <input
              type="datetime-local"
              value={form.publishedAt}
              onChange={(event) => updateField("publishedAt", event.target.value)}
            />
          </label>

          <label>
            {copy.excerpt}
            <textarea
              rows={3}
              value={form.excerpt}
              onChange={(event) => updateField("excerpt", event.target.value)}
              required
            />
          </label>

          <label>
            {copy.content}
            <textarea
              rows={14}
              value={form.content}
              onChange={(event) => updateField("content", event.target.value)}
              required
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="primary-btn" onClick={saveArticle} type="button" disabled={submitting}>
            {submitting ? copy.saving : form.id ? copy.update : copy.publish}
          </button>
          {form.id ? (
            <button
              className="secondary-btn secondary-btn-danger"
              onClick={removeArticle}
              type="button"
              disabled={submitting}
            >
              {copy.delete}
            </button>
          ) : null}
        </div>
        {error ? <p className="mt-3 text-sm text-[var(--danger)]">{error}</p> : null}
      </section>
    </div>
  );
}
