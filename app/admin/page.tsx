import { redirect } from "next/navigation";
import { AdminAiLogInbox } from "@/components/AdminAiLogInbox";
import { AdminArticleManager } from "@/components/AdminArticleManager";
import { listAiLogs } from "@/lib/ai-logs";
import { isAdminSession } from "@/lib/admin-auth";
import { listArticles } from "@/lib/articles";
import { getLocaleFromCookies } from "@/lib/locale";
import { hasSupabaseAdminConfig } from "@/lib/supabase";

export default async function AdminPage() {
  const locale = getLocaleFromCookies();
  if (!isAdminSession()) {
    redirect("/admin/login");
  }

  const articles = await listArticles();
  const aiLogsEnabled = hasSupabaseAdminConfig();
  const aiLogs = await listAiLogs({ status: "generated", limit: 20 });
  const copy =
    locale === "ko"
      ? {
          description: "Criteria 게시글을 생성, 수정, 삭제합니다.",
          logout: "로그아웃"
        }
      : {
          description: "Create, update, and delete posts for Criteria.",
          logout: "Logout"
        };

  return (
    <main className="app-main-wide space-y-6">
      <section className="paper-card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <div>
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">CMS</h1>
          <p className="text-sm text-[var(--muted)]">{copy.description}</p>
        </div>
        <form action="/api/admin/logout" method="post">
          <button className="secondary-btn" type="submit">
            {copy.logout}
          </button>
        </form>
      </section>

      <AdminAiLogInbox initialLogs={aiLogs} locale={locale} enabled={aiLogsEnabled} />
      <AdminArticleManager initialArticles={articles} locale={locale} />
    </main>
  );
}
