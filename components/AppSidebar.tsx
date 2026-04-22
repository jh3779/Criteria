"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LocaleToggle } from "@/components/LocaleToggle";
import type { Locale } from "@/lib/i18n";

type NavLabels = {
  home: string;
  think: string;
  articles: string;
  admin: string;
};

type Props = {
  locale: Locale;
  tagline: string;
  nav: NavLabels;
};

type NavItem = {
  href: string;
  label: string;
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNavLinks({
  pathname,
  items,
  onNavigate
}: {
  pathname: string;
  items: NavItem[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="sidebar-nav" aria-label="Main">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar({ locale, tagline, nav }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuLabels =
    locale === "ko"
      ? {
          menu: "메뉴",
          close: "닫기"
        }
      : {
          menu: "Menu",
          close: "Close"
        };

  const items: NavItem[] = [
    { href: "/", label: nav.home },
    { href: "/think", label: nav.think },
    { href: "/articles", label: nav.articles },
    { href: "/admin", label: nav.admin }
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="mobile-topbar md:hidden">
        <Link href="/" className="mobile-brand">
          Criteria
        </Link>
        <button
          type="button"
          className="menu-trigger"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label={open ? menuLabels.close : menuLabels.menu}
        >
          {open ? menuLabels.close : menuLabels.menu}
        </button>
      </div>

      <aside className="sidebar-desktop hidden md:block">
        <div className="sidebar-panel">
          <Link href="/" className="sidebar-brand">
            Criteria
          </Link>
          <p className="sidebar-tagline">{tagline}</p>
          <SidebarNavLinks pathname={pathname} items={items} />
          <div className="sidebar-locale">
            <LocaleToggle locale={locale} />
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              className="sidebar-backdrop md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-label={menuLabels.close}
            />
            <motion.aside
              className="sidebar-drawer md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34, mass: 0.8 }}
            >
              <div className="sidebar-panel h-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href="/" className="sidebar-brand" onClick={() => setOpen(false)}>
                      Criteria
                    </Link>
                    <p className="sidebar-tagline">{tagline}</p>
                  </div>
                  <button type="button" className="menu-trigger" onClick={() => setOpen(false)}>
                    {menuLabels.close}
                  </button>
                </div>
                <SidebarNavLinks pathname={pathname} items={items} onNavigate={() => setOpen(false)} />
                <div className="sidebar-locale mt-6">
                  <LocaleToggle locale={locale} />
                </div>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
