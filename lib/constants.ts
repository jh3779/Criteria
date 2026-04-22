import type { Article } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

const CATEGORY_LABELS_BY_LOCALE: Record<Locale, Record<string, string>> = {
  en: {
    choice: "Choice",
    regret: "Regret",
    growth: "Growth",
    relationship: "Relationship",
    pain: "Pain",
    "human-ai": "Human / AI"
  },
  ko: {
    choice: "선택",
    regret: "후회",
    growth: "성장",
    relationship: "관계",
    pain: "고통",
    "human-ai": "인간 / AI"
  }
};

export function getCategoryLabel(category: string, locale: Locale): string {
  return CATEGORY_LABELS_BY_LOCALE[locale][category] ?? category;
}

const now = new Date().toISOString();

export const SAMPLE_ARTICLES: Article[] = [
  {
    id: "seed-1",
    title: "How to Decide Between Persistence and Letting Go",
    slug: "persistence-vs-letting-go",
    excerpt:
      "A practical framing for deciding whether effort is still strategic or already sunk-cost driven.",
    content:
      "Start by naming the upside you are defending. Then identify the evidence horizon: how long until you can observe reliable signals? If the horizon is undefined, set a test window. Compare what continued effort costs now against what stopping costs later. Your decision should follow measurable signals, not emotional momentum.",
    category: "choice",
    publishedAt: now,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "seed-2",
    title: "Tradeoffs Behind Fast Growth",
    slug: "tradeoffs-behind-fast-growth",
    excerpt:
      "Growth speed can hide fragility. Build a decision lens that balances velocity with recoverability.",
    content:
      "Fast growth improves surface momentum but usually increases coordination debt. Ask what failures become irreversible if growth continues at current speed. If reversibility drops below a safe threshold, increase instrumentation before scaling further.",
    category: "growth",
    publishedAt: now,
    createdAt: now,
    updatedAt: now
  }
];
