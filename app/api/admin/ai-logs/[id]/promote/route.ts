import { NextResponse } from "next/server";
import { getAiLogById, markAiLogPromoted } from "@/lib/ai-logs";
import { createArticle } from "@/lib/articles";
import { isAdminSession } from "@/lib/admin-auth";
import { slugify } from "@/lib/slug";
import type { ArticleInput, StructuredThinking } from "@/lib/types";

type PromoteBody = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  publishedAt?: string;
};

function buildContentFallback(structured: StructuredThinking): string {
  const lines: string[] = [
    "## 1. Problem Definition",
    structured.problem_definition,
    "",
    "## 2. Condition Isolation"
  ];

  for (const condition of structured.condition_isolation) {
    lines.push(`- **${condition.variable}**`);
    lines.push(`  - Signal: ${condition.signal}`);
    lines.push(`  - Implication: ${condition.implication}`);
  }

  lines.push("", "## 3. Perspective Comparison");
  for (const perspective of structured.perspective_comparison) {
    lines.push(`### ${perspective.name}`);
    lines.push(`- Core View: ${perspective.core_view}`);
    lines.push(`- Works Best When: ${perspective.when_it_works}`);
    lines.push(`- Blind Spot: ${perspective.blind_spot}`);
  }

  lines.push("", "## 4. Trade-offs");
  for (const tradeoff of structured.tradeoffs) {
    lines.push(`- **Choice:** ${tradeoff.choice}`);
    lines.push(`  - Gain: ${tradeoff.gain}`);
    lines.push(`  - Price of Choice: ${tradeoff.price}`);
  }

  lines.push("", "## 5. Decision Criteria");
  for (const criterion of structured.decision_criteria) {
    lines.push(`1. ${criterion}`);
  }

  lines.push("", "## 6. Conclusion", structured.conclusion);
  return lines.join("\n");
}

function ensureSlug(input: string, fallbackSeed: string): string {
  const normalized = slugify(input);
  if (normalized) {
    return normalized;
  }

  return `ai-log-${fallbackSeed}`;
}

function validatePayload(body: ArticleInput): string | null {
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

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAdminSession()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const aiLog = await getAiLogById(params.id);
    if (!aiLog) {
      return NextResponse.json({ error: "AI log not found." }, { status: 404 });
    }

    if (aiLog.status !== "generated") {
      return NextResponse.json({ error: "AI log is not in a promotable state." }, { status: 409 });
    }

    const body = (await request.json()) as PromoteBody;
    const title = body.title?.trim() || aiLog.question.trim().slice(0, 90) || "AI Structure Note";
    const payload: ArticleInput = {
      title,
      slug: ensureSlug((body.slug || title).trim(), aiLog.id.slice(0, 8)),
      excerpt: body.excerpt?.trim() || aiLog.responseJson.problem_definition.trim(),
      content: body.content?.trim() || buildContentFallback(aiLog.responseJson),
      category: body.category?.trim() || "choice",
      sourceAiLogId: params.id,
      publishedAt: body.publishedAt
    };

    const validationError = validatePayload(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const post = await createArticle(payload);
    await markAiLogPromoted(params.id, post.id);

    return NextResponse.json({ data: post }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
