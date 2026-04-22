"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const LABELS: Record<Locale, { en: string; ko: string }> = {
  en: {
    en: "English",
    ko: "Korean"
  },
  ko: {
    en: "영어",
    ko: "한국어"
  }
};

export function LocaleToggle({ locale }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const labels = LABELS[locale];

  async function setLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    setError(null);

    const response = await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale })
    });

    if (!response.ok) {
      throw new Error(locale === "ko" ? "언어 변경에 실패했습니다." : "Failed to switch language.");
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex overflow-hidden rounded-full border border-[var(--border)] bg-[var(--paper-soft)]">
        <button
          className={`rounded-none px-3 py-2 text-xs font-semibold ${
            locale === "ko" ? "bg-[var(--accent)] text-white" : "bg-transparent text-[var(--text)]"
          }`}
          disabled={pending}
          onClick={() => {
            void setLocale("ko").catch((setLocaleError) =>
              setError(
                setLocaleError instanceof Error
                  ? setLocaleError.message
                  : locale === "ko"
                    ? "언어 변경에 실패했습니다."
                    : "Failed to switch language."
              )
            );
          }}
          type="button"
        >
          {labels.ko}
        </button>
        <button
          className={`rounded-none border-l border-[var(--border)] px-3 py-2 text-xs font-semibold ${
            locale === "en" ? "bg-[var(--accent)] text-white" : "bg-transparent text-[var(--text)]"
          }`}
          disabled={pending}
          onClick={() => {
            void setLocale("en").catch((setLocaleError) =>
              setError(
                setLocaleError instanceof Error
                  ? setLocaleError.message
                  : locale === "ko"
                    ? "언어 변경에 실패했습니다."
                    : "Failed to switch language."
              )
            );
          }}
          type="button"
        >
          {labels.en}
        </button>
      </div>
      {error ? <span className="text-xs text-[var(--danger)]">{error}</span> : null}
    </div>
  );
}
