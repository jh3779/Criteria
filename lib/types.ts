export const ARTICLE_CATEGORIES = [
  "choice",
  "regret",
  "growth",
  "relationship",
  "pain",
  "human-ai"
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export type ConditionItem = {
  variable: string;
  signal: string;
  implication: string;
};

export type Perspective = {
  name: string;
  core_view: string;
  when_it_works: string;
  blind_spot: string;
};

export type TradeoffItem = {
  choice: string;
  gain: string;
  price: string;
};

export type StructuredThinking = {
  problem_definition: string;
  condition_isolation: ConditionItem[];
  perspective_comparison: Perspective[];
  tradeoffs: TradeoffItem[];
  decision_criteria: string[];
  conclusion: string;
};

export type StructuredApiError = {
  code?: "STRUCTURE_RULE_VIOLATION";
  error: string;
  violations?: string[];
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  sourceAiLogId?: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ArticleInput = {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category: string;
  sourceAiLogId?: string;
  publishedAt?: string;
};

export type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categories:
    | {
        slug: string;
        name: string;
        name_ko: string | null;
      }
    | Array<{
        slug: string;
        name: string;
        name_ko: string | null;
      }>
    | null;
  source_ai_log_id: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
};

export type AiLogRow = {
  id: string;
  question: string;
  locale: string;
  model: string;
  response_json: StructuredThinking;
  status: "generated" | "promoted" | "archived";
  promoted_post_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AiLog = {
  id: string;
  question: string;
  locale: string;
  model: string;
  responseJson: StructuredThinking;
  status: "generated" | "promoted" | "archived";
  promotedPostId: string | null;
  createdAt: string;
  updatedAt: string;
};
