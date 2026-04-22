import type { Locale } from "@/lib/i18n";
import type { Perspective } from "@/lib/types";

type Props = {
  locale: Locale;
  perspectives: Perspective[];
};

export function ComparisonGrid({ locale, perspectives }: Props) {
  const labels =
    locale === "ko"
      ? {
          view: "핵심 시각",
          works: "유효 조건",
          blind: "맹점"
        }
      : {
          view: "Core View",
          works: "Works Best When",
          blind: "Blind Spot"
        };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {perspectives.map((perspective) => (
        <article key={perspective.name} className="rounded-xl border border-[var(--border)] bg-[var(--paper-soft)] p-4">
          <h4 className="text-base font-semibold text-[var(--text)]">{perspective.name}</h4>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="font-semibold text-[var(--muted-strong)]">{labels.view}</dt>
              <dd className="mt-1 text-[var(--text)]">{perspective.core_view}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--muted-strong)]">{labels.works}</dt>
              <dd className="mt-1 text-[var(--text)]">{perspective.when_it_works}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--muted-strong)]">{labels.blind}</dt>
              <dd className="mt-1 text-[var(--text)]">{perspective.blind_spot}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}
