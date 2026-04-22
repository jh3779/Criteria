import { SAMPLE_ARTICLES } from "@/lib/constants";
import {
  createSupabaseAdminClient,
  createSupabasePublicClient,
  hasSupabaseAdminConfig,
  hasSupabaseConfig
} from "@/lib/supabase";
import type { Article, ArticleInput, ArticleRow } from "@/lib/types";

type ListArticleParams = {
  category?: string;
  query?: string;
  limit?: number;
};

const POST_SELECT =
  "id,title,slug,excerpt,content,source_ai_log_id,published_at,created_at,updated_at,categories!posts_category_id_fkey(slug,name,name_ko)";

function getCategorySlug(categories: ArticleRow["categories"]): string {
  if (Array.isArray(categories)) {
    return categories[0]?.slug ?? "choice";
  }

  return categories?.slug ?? "choice";
}

function mapRowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    category: getCategorySlug(row.categories),
    sourceAiLogId: row.source_ai_log_id,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function searchMatch(article: Article, query: string): boolean {
  const normalized = query.toLowerCase();
  return (
    article.title.toLowerCase().includes(normalized) ||
    article.excerpt.toLowerCase().includes(normalized) ||
    article.content.toLowerCase().includes(normalized)
  );
}

async function getCategoryIdBySlug(
  supabase: ReturnType<typeof createSupabasePublicClient>,
  categorySlug: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve category: ${error.message}`);
  }

  return data?.id ?? null;
}

async function requireCategoryId(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  categorySlug: string
): Promise<string> {
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve category: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error(`Category not found for slug "${categorySlug}".`);
  }

  return data.id;
}

export async function listArticles(params: ListArticleParams = {}): Promise<Article[]> {
  const { category, query, limit } = params;

  if (!hasSupabaseConfig()) {
    let local = [...SAMPLE_ARTICLES];

    if (category) {
      local = local.filter((article) => article.category === category);
    }

    if (query) {
      local = local.filter((article) => searchMatch(article, query));
    }

    local.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

    return typeof limit === "number" ? local.slice(0, limit) : local;
  }

  const supabase = createSupabasePublicClient();
  let request = supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("is_public", true)
    .order("published_at", { ascending: false });

  if (category) {
    const categoryId = await getCategoryIdBySlug(supabase, category);
    if (!categoryId) {
      return [];
    }
    request = request.eq("category_id", categoryId);
  }

  if (query) {
    request = request.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`);
  }

  if (typeof limit === "number") {
    request = request.limit(limit);
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(`Failed to load posts: ${error.message}`);
  }

  return (data ?? []).map((row) => mapRowToArticle(row as ArticleRow));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!hasSupabaseConfig()) {
    return SAMPLE_ARTICLES.find((article) => article.slug === slug) ?? null;
  }

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load post: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapRowToArticle(data as ArticleRow);
}

export async function getArticleById(id: string): Promise<Article | null> {
  if (!hasSupabaseConfig()) {
    return SAMPLE_ARTICLES.find((article) => article.id === id) ?? null;
  }

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.from("posts").select(POST_SELECT).eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Failed to load post: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapRowToArticle(data as ArticleRow);
}

export async function createArticle(payload: ArticleInput): Promise<Article> {
  if (!hasSupabaseAdminConfig()) {
    throw new Error("Supabase admin env vars are required for write operations.");
  }

  const supabase = createSupabaseAdminClient();
  const categoryId = await requireCategoryId(supabase, payload.category);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      category_id: categoryId,
      title: payload.title,
      slug: payload.slug,
      excerpt: payload.excerpt,
      content: payload.content,
      source_ai_log_id: payload.sourceAiLogId ?? null,
      published_at: payload.publishedAt ?? new Date().toISOString()
    })
    .select(POST_SELECT)
    .single();

  if (error) {
    throw new Error(`Failed to create post: ${error.message}`);
  }

  return mapRowToArticle(data as ArticleRow);
}

export async function updateArticle(id: string, payload: ArticleInput): Promise<Article> {
  if (!hasSupabaseAdminConfig()) {
    throw new Error("Supabase admin env vars are required for write operations.");
  }

  const supabase = createSupabaseAdminClient();
  const categoryId = await requireCategoryId(supabase, payload.category);

  const updatePayload: Record<string, string | null> = {
    category_id: categoryId,
    title: payload.title,
    slug: payload.slug ?? null,
    excerpt: payload.excerpt,
    content: payload.content,
    updated_at: new Date().toISOString()
  };

  if (payload.sourceAiLogId !== undefined) {
    updatePayload.source_ai_log_id = payload.sourceAiLogId || null;
  }

  if (payload.publishedAt) {
    updatePayload.published_at = payload.publishedAt;
  }

  const { data, error } = await supabase
    .from("posts")
    .update(updatePayload)
    .eq("id", id)
    .select(POST_SELECT)
    .single();

  if (error) {
    throw new Error(`Failed to update post: ${error.message}`);
  }

  return mapRowToArticle(data as ArticleRow);
}

export async function deleteArticle(id: string): Promise<void> {
  if (!hasSupabaseAdminConfig()) {
    throw new Error("Supabase admin env vars are required for write operations.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete post: ${error.message}`);
  }
}
