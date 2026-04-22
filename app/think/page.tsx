import { QuestionStructureForm } from "@/components/QuestionStructureForm";
import { getLocaleFromCookies } from "@/lib/locale";

function parseSeed(seed?: string | string[]): string {
  if (Array.isArray(seed)) {
    return seed[0]?.trim() ?? "";
  }

  return seed?.trim() ?? "";
}

export default function ThinkPage({
  searchParams
}: {
  searchParams?: { seed?: string | string[] };
}) {
  const locale = getLocaleFromCookies();
  const initialQuestion = parseSeed(searchParams?.seed);
  const copy =
    locale === "ko"
      ? {
          eyebrow: "생각 워크스페이스",
          title: "생각 정리",
          subtitle: "질문을 6단계 구조로 분리해 스스로 판단 기준을 만들도록 돕습니다."
        }
      : {
          eyebrow: "Think Workspace",
          title: "Think",
          subtitle: "Break your question into 6 sections and build your own decision criteria."
        };

  return (
    <main className="app-main space-y-7">
      <section className="paper-card p-6 md:p-8">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)] md:text-4xl">{copy.title}</h1>
        <p className="mt-2 text-base text-[var(--muted)]">{copy.subtitle}</p>
      </section>
      <QuestionStructureForm locale={locale} initialQuestion={initialQuestion} />
    </main>
  );
}
