import { NextResponse } from "next/server";
import { isLocale, LOCALE_COOKIE_NAME, type Locale } from "@/lib/i18n";

type LocaleBody = {
  locale?: Locale;
};

function cookieOptions() {
  return {
    httpOnly: false,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LocaleBody;
  const locale = body.locale;

  if (!isLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, locale });
  response.cookies.set(LOCALE_COOKIE_NAME, locale, cookieOptions());
  return response;
}
