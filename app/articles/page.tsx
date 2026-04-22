import Link from "next/link";
import { listArticles } from "@/lib/articles";
import { getCategoryLabel } from "@/lib/constants";
import { getLocaleFromCookies } from "@/lib/locale";
import { ARTICLE_CATEGORIES } from "@/lib/types";

export default async function ArticleListPage({
  searchParams
}: {
  searchParams?: { category?: string; q?: string };
}) {
  const locale = getLocaleFromCookies();
  const category = searchParams?.category?.trim() || undefined;
  const query = searchParams?.q?.trim() || undefined;
  const articles = await listArticles({ category, query });
  const copy =
    locale === "ko"
      ? {
          title: "글 리스트",
          search: "검색",
          searchPlaceholder: "제목 또는 키워드",
          category: "카테고리",
          all: "전체",
          apply: "적용",
          noMatch: "일치하는 콘텐츠가 없습니다."
        }
      : {
          title: "Posts",
          search: "Search",
          searchPlaceholder: "title or keyword",
          category: "Category",
          all: "All",
          apply: "Apply",
          noMatch: "No matching content found."
        };

  return (
    <main className="app-main space-y-7">
      <section className="paper-card p-5 md:p-7">
        <p className="eyebrow mb-2">{locale === "ko" ? "읽기 목록" : "Reading List"}</p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--text)] md:text-4xl">{copy.title}</h1>

        <form className="grid gap-3 md:grid-cols-[1.6fr_0.8fr_0.4fr]">
          <label>
            {copy.search}
            <input defaultValue={query} name="q" placeholder={copy.searchPlaceholder} />
          </label>

          <label>
            {copy.category}
            <select defaultValue={category ?? ""} name="category">
              <option value="">{copy.all}</option>
              {ARTICLE_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {getCategoryLabel(item, locale)}
                </option>
              ))}
            </select>
          </label>

          <div className="self-end">
            <button type="submit" className="primary-btn w-full">
              {copy.apply}
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4">
        {articles.map((article) => (
          <Link key={article.id} href={`/articles/${article.slug}`} className="doc-link-card p-5 md:p-6">
            <p className="eyebrow mb-2 text-[var(--accent)]">
              {getCategoryLabel(article.category, locale)}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)] md:text-3xl">{article.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted)] md:text-base">{article.excerpt}</p>
          </Link>
        ))}
        {articles.length === 0 ? <p className="paper-card p-5">{copy.noMatch}</p> : null}
      </section>
    </main>
  );
}
