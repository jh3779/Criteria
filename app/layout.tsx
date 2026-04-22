import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_KR } from "next/font/google";
import { AppSidebar } from "@/components/AppSidebar";
import { getLocaleFromCookies } from "@/lib/locale";
import "./globals.css";

const uiFont = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "700"]
});

const bodyFont = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"]
});

export const metadata: Metadata = {
  title: "Criteria",
  description: "정답이 아니라 기준을 제공합니다."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = getLocaleFromCookies();
  const nav =
    locale === "ko"
      ? {
          tagline: "정답이 아니라 기준을 제공합니다.",
          home: "홈",
          think: "생각 정리",
          articles: "포스트",
          admin: "관리"
        }
      : {
          tagline: "Beyond Answers, Build Your Criteria.",
          home: "Home",
          think: "Think",
          articles: "Posts",
          admin: "Admin"
        };

  return (
    <html lang={locale}>
      <body className={`${uiFont.variable} ${bodyFont.variable}`}>
        <div className="app-layout">
          <AppSidebar locale={locale} nav={nav} tagline={nav.tagline} />
          <div className="content-area">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
