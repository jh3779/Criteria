import Link from "next/link";
import { HomeThinkPrompt } from "@/components/HomeThinkPrompt";
import { listArticles } from "@/lib/articles";
import { getCategoryLabel } from "@/lib/constants";
import { ARTICLE_CATEGORIES } from "@/lib/types";
import { getLocaleFromCookies } from "@/lib/locale";

export default async function HomePage() {
  const locale = getLocaleFromCookies();
  const posts = await listArticles({ limit: 6 });

  const copy =
    locale === "ko"
      ? {
          title: "Criteria",
          subtitle:
            "정답을 강요하지 않고, 질문을 구조화해 스스로 판단 기준을 만들도록 돕는 인터페이스입니다.",
          categories: "카테고리",
          latest: "글 리스트",
          viewAll: "전체 보기",
          empty: "등록된 글이 없습니다."
        }
      : {
          title: "Criteria",
          subtitle: "An interface that helps you build your own criteria instead of giving one final answer.",
          categories: "Categories",
          latest: "Posts",
          viewAll: "View all",
          empty: "No posts yet."
        };

  return (
    <main className="app-main space-y-7 md:space-y-9">
      <section className="paper-card p-6 md:p-9">
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--text)] md:text-5xl">{copy.title}</h1>
        <p className="mt-3 max-w-3xl text-lg text-[var(--muted)]">{copy.subtitle}</p>
      </section>

      <HomeThinkPrompt locale={locale} />

      <section className="paper-card p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">{copy.categories}</h2>
          <Link href="/articles" className="secondary-btn inline-flex items-center">
            {copy.viewAll}
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {ARTICLE_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/articles?category=${category}`}
              className="tag-pill"
            >
              {getCategoryLabel(category, locale)}
            </Link>
          ))}
        </div>
      </section>

      <section className="paper-card p-6 md:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">{copy.latest}</h2>
          <Link href="/articles" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--text)]">
            {copy.viewAll}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} href={`/articles/${post.slug}`} className="doc-link-card">
              <p className="eyebrow text-[var(--accent-ink)]">{getCategoryLabel(post.category, locale)}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text)]">{post.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{post.excerpt}</p>
            </Link>
          ))}
          {posts.length === 0 ? <p className="text-sm text-[var(--muted)]">{copy.empty}</p> : null}
        </div>
      </section>
    </main>
  );
}
