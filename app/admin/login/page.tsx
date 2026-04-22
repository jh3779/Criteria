import { AdminLoginForm } from "@/components/AdminLoginForm";
import { getLocaleFromCookies } from "@/lib/locale";

export default function AdminLoginPage() {
  const locale = getLocaleFromCookies();
  return <AdminLoginForm locale={locale} />;
}
