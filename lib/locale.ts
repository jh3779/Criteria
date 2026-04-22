import { cookies } from "next/headers";
import { normalizeLocale, type Locale, LOCALE_COOKIE_NAME } from "@/lib/i18n";

export function getLocaleFromCookies(): Locale {
  return normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);
}
