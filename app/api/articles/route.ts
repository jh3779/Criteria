import { NextResponse } from "next/server";
import { createArticle, listArticles } from "@/lib/articles";
import { isAdminSession } from "@/lib/admin-auth";
import { slugify } from "@/lib/slug";
import type { ArticleInput } from "@/lib/types";

function validateArticleInput(body: Partial<ArticleInput>): string | null {
  if (!body.title || body.title.trim().length < 3) {
    return "Title must be at least 3 characters.";
  }

  if (!body.excerpt || body.excerpt.trim().length < 10) {
    return "Excerpt must be at least 10 characters.";
  }

  if (!body.content || body.content.trim().length < 20) {
    return "Content must be at least 20 characters.";
  }

  if (!body.category || body.category.trim().length < 2) {
    return "Category is required.";
  }

  return null;
}

function toArticleInput(body: Partial<ArticleInput>): ArticleInput {
  return {
    title: body.title!.trim(),
    slug: slugify((body.slug || body.title || "").trim()),
    excerpt: body.excerpt!.trim(),
    content: body.content!.trim(),
    category: body.category!.trim(),
    sourceAiLogId: body.sourceAiLogId,
    publishedAt: body.publishedAt
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const query = searchParams.get("q") ?? undefined;

    const data = await listArticles({ category, query });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdminSession()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<ArticleInput>;
    const validationError = validateArticleInput(body);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const data = await createArticle(toArticleInput(body));
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
