import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/articles";
import { getCategoryLabel } from "@/lib/constants";
import { getLocaleFromCookies } from "@/lib/locale";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const locale = getLocaleFromCookies();
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: locale === "ko" ? "글을 찾을 수 없음 | Criteria" : "Post Not Found | Criteria"
    };
  }

  return {
    title: `${article.title} | Criteria`,
    description: article.excerpt
  };
}

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const locale = getLocaleFromCookies();
  const article = await getArticleBySlug(params.slug);
  const publishedLabel = locale === "ko" ? "게시일" : "Published";
  const dateLocale = locale === "ko" ? "ko-KR" : "en-US";
  const ctaLabel = locale === "ko" ? "이 주제로 생각 정리하기" : "Think from This Post";

  if (!article) {
    notFound();
  }

  const seed =
    locale === "ko"
      ? `질문: ${article.title}\n맥락: ${article.excerpt}\n\n이 질문을 6단계 사고 구조로 정리해줘.`
      : `Question: ${article.title}\nContext: ${article.excerpt}\n\nPlease structure this question with the 6-step thinking map.`;

  return (
    <main className="app-main">
      <article className="paper-card mx-auto max-w-3xl p-6 md:p-10">
        <p className="eyebrow mb-3 text-[var(--accent)]">
          {getCategoryLabel(article.category, locale)}
        </p>
        <h1 className="mb-3 text-3xl font-semibold leading-tight tracking-tight text-[var(--text)] md:text-4xl">
          {article.title}
        </h1>
        <p className="mb-6 text-sm text-[var(--muted)]">
          {publishedLabel} {new Date(article.publishedAt).toLocaleDateString(dateLocale, { dateStyle: "medium" })}
        </p>
        <div className="mb-6">
          <Link
            href={{ pathname: "/think", query: { seed } }}
            className="secondary-btn inline-flex items-center"
          >
            {ctaLabel}
          </Link>
        </div>
        <div className="content-serif max-w-none space-y-4 whitespace-pre-wrap text-lg leading-relaxed text-[var(--text)]">
          {article.content}
        </div>
      </article>
    </main>
  );
}
