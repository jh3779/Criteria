"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export function HomeThinkPrompt({ locale }: Props) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const copy =
    locale === "ko"
      ? {
          title: "지금 떠오른 질문을 적어보세요",
          label: "질문 입력",
          placeholder: "예: 지금의 선택이 6개월 뒤 나에게 어떤 영향을 줄까?",
          cta: "생각 구조 만들기"
        }
      : {
          title: "Start with a question you are carrying now",
          label: "Your question",
          placeholder: "Example: How will this choice impact me in six months?",
          cta: "Build Thinking Structure"
        };

  const microcopy =
    locale === "ko"
      ? [
          "정답이 아니라 기준을 제공합니다",
          "이건 하나의 관점일 뿐입니다",
          "상황에 따라 다르게 해석될 수 있습니다"
        ]
      : [
          "We provide criteria, not final answers.",
          "This is only one possible perspective.",
          "Interpretation can change by context."
        ];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const seed = question.trim();
    if (seed.length < 8) {
      return;
    }

    router.push(`/think?seed=${encodeURIComponent(seed)}`);
  }

  return (
    <section className="paper-card p-6 md:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">{copy.title}</h2>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <label htmlFor="home-question">{copy.label}</label>
        <textarea
          id="home-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={copy.placeholder}
          rows={4}
          minLength={8}
          required
        />
        <button className="primary-btn" type="submit">
          {copy.cta}
        </button>
      </form>

      <ul className="microcopy-list mt-5 space-y-1">
        {microcopy.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
