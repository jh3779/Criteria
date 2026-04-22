import { NextResponse } from "next/server";
import { validateStructuredThinking } from "@/lib/ai-guard";
import { saveAiLog } from "@/lib/ai-logs";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import type { StructuredThinking } from "@/lib/types";

type OpenAIResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
      refusal?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

type RequestBody = {
  question?: string;
  locale?: string;
};

const structureSchema = {
  name: "criteria_structure",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      problem_definition: { type: "string" },
      condition_isolation: {
        type: "array",
        minItems: 2,
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            variable: { type: "string" },
            signal: { type: "string" },
            implication: { type: "string" }
          },
          required: ["variable", "signal", "implication"]
        }
      },
      perspective_comparison: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            core_view: { type: "string" },
            when_it_works: { type: "string" },
            blind_spot: { type: "string" }
          },
          required: ["name", "core_view", "when_it_works", "blind_spot"]
        }
      },
      tradeoffs: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            choice: { type: "string" },
            gain: { type: "string" },
            price: { type: "string" }
          },
          required: ["choice", "gain", "price"]
        }
      },
      decision_criteria: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: { type: "string" }
      },
      conclusion: { type: "string" }
    },
    required: [
      "problem_definition",
      "condition_isolation",
      "perspective_comparison",
      "tradeoffs",
      "decision_criteria",
      "conclusion"
    ]
  }
};

function buildSystemPrompt(locale: Locale, violationHints: string[] = []): string {
  const responseLanguage =
    locale === "ko"
      ? "Write every field in natural Korean."
      : "Write every field in concise professional English.";
  const guardHint =
    violationHints.length > 0
      ? [
          "Previous response violated policy. Fix every issue below:",
          ...violationHints.map((violation, index) => `${index + 1}) ${violation}`)
        ].join("\n")
      : "";

  return [
    "You are Criteria, a thought-structuring engine.",
    "Do not provide recommendations or final decisions.",
    "You must never answer in binary yes/no form.",
    "Always begin by reframing the user's problem in context.",
    "Then follow this exact 6-step map:",
    "1) problem_definition",
    "2) condition_isolation (time, money, emotion, risk, leverage, constraints)",
    "3) perspective_comparison (2 to 4 distinct angles)",
    "4) tradeoffs (price of each choice: gain vs cost)",
    "5) decision_criteria (exactly 3 self-check questions)",
    "6) conclusion (summary of the thought map, no recommendation)",
    "Keep content specific, falsifiable, and decision-useful.",
    responseLanguage,
    guardHint
  ]
    .filter(Boolean)
    .join("\n");
}

function parseMessageContent(content: OpenAIResponse["choices"]) {
  const raw = content?.[0]?.message?.content;

  if (typeof raw === "string") {
    return raw;
  }

  if (Array.isArray(raw)) {
    return raw
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .join("")
      .trim();
  }

  return "";
}

async function generateStructuredThinking(params: {
  apiKey: string;
  locale: Locale;
  model: string;
  question: string;
  violationHints?: string[];
}): Promise<
  | { ok: true; data: StructuredThinking }
  | { ok: false; status: number; error: string }
> {
  const { apiKey, locale, model, question, violationHints = [] } = params;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: buildSystemPrompt(locale, violationHints) },
        { role: "user", content: question }
      ],
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: structureSchema
      }
    })
  });

  const payload = (await response.json()) as OpenAIResponse;
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: payload.error?.message ?? "OpenAI API call failed"
    };
  }

  const parsedText = parseMessageContent(payload.choices);
  if (!parsedText) {
    return {
      ok: false,
      status: 502,
      error: "OpenAI returned empty content."
    };
  }

  try {
    const data = JSON.parse(parsedText) as StructuredThinking;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      status: 502,
      error: "OpenAI returned invalid JSON content."
    };
  }
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY env var is missing." }, { status: 500 });
    }

    const body = (await request.json()) as RequestBody;
    const question = body.question?.trim();
    const locale = normalizeLocale(body.locale);
    if (!question || question.length < 8) {
      return NextResponse.json({ error: "Question must be at least 8 characters." }, { status: 400 });
    }

    const model = process.env.OPENAI_MODEL ?? "gpt-4o";
    let violations: string[] = [];

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const result = await generateStructuredThinking({
        apiKey,
        locale,
        model,
        question,
        violationHints: attempt === 0 ? [] : violations
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      violations = validateStructuredThinking(result.data);
      if (violations.length === 0) {
        const logId = await saveAiLog({ question, locale, model, structured: result.data });
        return NextResponse.json({ data: result.data, logId });
      }
    }

    return NextResponse.json(
      {
        code: "STRUCTURE_RULE_VIOLATION",
        error: "AI response violated structure rules after retry.",
        violations
      },
      { status: 422 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
