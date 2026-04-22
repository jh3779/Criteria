import { NextResponse } from "next/server";
import { deleteArticle, getArticleById, updateArticle } from "@/lib/articles";
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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const data = await getArticleById(params.id);

    if (!data) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAdminSession()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<ArticleInput>;
    const validationError = validateArticleInput(body);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const data = await updateArticle(params.id, toArticleInput(body));
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAdminSession()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteArticle(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
