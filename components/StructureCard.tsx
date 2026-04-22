import type { ReactNode } from "react";

type Props = {
  step: string;
  title: string;
  children: ReactNode;
  helper?: string;
  className?: string;
};

export function StructureCard({ step, title, helper, className, children }: Props) {
  return (
    <section className={`structure-card ${className ?? ""}`}>
      <header className="mb-4 border-b border-[var(--border)] pb-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{step}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">{title}</h3>
        {helper ? <p className="mt-2 text-sm text-[var(--muted)]">{helper}</p> : null}
      </header>
      <div className="text-[15px] leading-7 text-[var(--text)]">{children}</div>
    </section>
  );
}
