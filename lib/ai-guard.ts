import type { StructuredThinking } from "@/lib/types";

const BINARY_PATTERNS: RegExp[] = [
  /\b(the answer is|final answer is)\s+(yes|no)\b/i,
  /\b(simply|just)\s+(yes|no)\b/i,
  /(정답은|결론은)\s*(예|아니오|맞다|틀리다)/i
];

const PRESCRIPTIVE_PATTERNS: RegExp[] = [
  /\b(you must|you should definitely|you need to)\b/i,
  /\b(definitely choose|the only correct choice)\b/i,
  /(무조건|반드시)\s*.+(해야 한다|해야합니다|해라)/i,
  /(정답은)\s*.+(이다|입니다)/i
];

function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

export function flattenStructuredThinking(data: StructuredThinking): string {
  const chunks: string[] = [data.problem_definition, data.conclusion];

  for (const item of data.condition_isolation) {
    chunks.push(item.variable, item.signal, item.implication);
  }

  for (const item of data.perspective_comparison) {
    chunks.push(item.name, item.core_view, item.when_it_works, item.blind_spot);
  }

  for (const item of data.tradeoffs) {
    chunks.push(item.choice, item.gain, item.price);
  }

  for (const item of data.decision_criteria) {
    chunks.push(item);
  }

  return chunks.join("\n");
}

export function validateStructuredThinking(data: StructuredThinking): string[] {
  const violations = new Set<string>();
  const flattened = flattenStructuredThinking(data);

  if (BINARY_PATTERNS.some((pattern) => pattern.test(flattened))) {
    violations.add("Binary framing detected (yes/no style conclusion).");
  }

  if (PRESCRIPTIVE_PATTERNS.some((pattern) => pattern.test(flattened))) {
    violations.add("Prescriptive recommendation detected (answer-giving language).");
  }

  const perspectiveCount = data.perspective_comparison.length;
  if (perspectiveCount < 2 || perspectiveCount > 4) {
    violations.add("Perspective count must be between 2 and 4.");
  }

  const seenPerspectiveNames = new Set<string>();
  for (const perspective of data.perspective_comparison) {
    const normalizedName = normalizeText(perspective.name);
    if (!normalizedName) {
      violations.add("Perspective name cannot be empty.");
      continue;
    }

    if (seenPerspectiveNames.has(normalizedName)) {
      violations.add("Duplicate perspective names detected.");
      continue;
    }

    seenPerspectiveNames.add(normalizedName);
  }

  for (const tradeoff of data.tradeoffs) {
    const gain = normalizeText(tradeoff.gain);
    const price = normalizeText(tradeoff.price);

    if (!gain || !price) {
      violations.add("Tradeoff gain/price cannot be empty.");
      continue;
    }

    if (gain === price) {
      violations.add("Tradeoff gain and price must describe different outcomes.");
    }
  }

  return Array.from(violations);
}
