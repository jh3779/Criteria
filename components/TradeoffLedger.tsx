import type { Locale } from "@/lib/i18n";
import type { TradeoffItem } from "@/lib/types";

type Props = {
  locale: Locale;
  tradeoffs: TradeoffItem[];
};

export function TradeoffLedger({ locale, tradeoffs }: Props) {
  const labels =
    locale === "ko"
      ? {
          choice: "선택",
          gain: "얻는 것",
          price: "대가(잃는 것)"
        }
      : {
          choice: "Choice",
          gain: "Gain",
          price: "Price of Choice"
        };

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead className="bg-[var(--surface-muted)] text-left">
          <tr>
            <th className="border-b border-[var(--border)] px-4 py-3 font-semibold text-[var(--text)]">
              {labels.choice}
            </th>
            <th className="border-b border-[var(--border)] px-4 py-3 font-semibold text-[var(--text)]">
              {labels.gain}
            </th>
            <th className="border-b border-[var(--border)] px-4 py-3 font-semibold text-[var(--text)]">
              {labels.price}
            </th>
          </tr>
        </thead>
        <tbody>
          {tradeoffs.map((item) => (
            <tr key={`${item.choice}-${item.gain}`}>
              <td className="border-b border-[var(--border)] px-4 py-3 align-top text-[var(--text)]">{item.choice}</td>
              <td className="border-b border-[var(--border)] px-4 py-3 align-top text-[var(--text)]">{item.gain}</td>
              <td className="border-b border-[var(--border)] px-4 py-3 align-top text-[var(--text)]">{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
