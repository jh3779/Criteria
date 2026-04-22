"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export function AdminLoginForm({ locale }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const copy =
    locale === "ko"
      ? {
          title: "관리자 로그인",
          password: "비밀번호",
          signingIn: "로그인 중...",
          signIn: "로그인",
          loginFailed: "로그인에 실패했습니다.",
          unexpectedError: "예상치 못한 오류가 발생했습니다."
        }
      : {
          title: "Admin Login",
          password: "Password",
          signingIn: "Signing in...",
          signIn: "Sign in",
          loginFailed: "Login failed",
          unexpectedError: "Unexpected error"
        };

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? copy.loginFailed);
      }

      router.push("/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : copy.unexpectedError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-main mx-auto w-full max-w-md">
      <section className="paper-card p-5 md:p-7">
        <p className="eyebrow mb-2">Admin</p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--text)]">{copy.title}</h1>
        <form className="space-y-3" onSubmit={handleLogin}>
          <label>
            {copy.password}
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button disabled={loading} type="submit" className="primary-btn w-full">
            {loading ? copy.signingIn : copy.signIn}
          </button>
        </form>
        {error ? <p className="mt-3 text-sm text-[var(--danger)]">{error}</p> : null}
      </section>
    </main>
  );
}
