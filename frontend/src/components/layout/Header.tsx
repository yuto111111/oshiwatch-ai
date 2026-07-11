"use client";

// ハッカソン用ミニマル Header (auth / notification / settings / community 削除)。
// ロゴ + 「推しを探す」だけの構成。

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Music2 } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const BRAND_SKY = "#0EA5E9";

export default function Header() {
  const pathname = usePathname();
  const { t } = useLocale();

  const navItems = [{ href: "/", label: t("nav.home"), icon: Home }];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b backdrop-blur"
        style={{
          background: "rgba(255,255,255,0.92)",
          borderColor: "#CBD5E1",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: "linear-gradient(135deg, #6B46C1, #0EA5E9)" }}
            >
              <Music2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-base hidden sm:block text-gray-900">
              {t("app.title")}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 ml-2">
            {navItems.map(({ icon: Icon, label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all"
                  style={{
                    background: active ? `${BRAND_SKY}1f` : "transparent",
                    color: active ? BRAND_SKY : "#475569",
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 ml-auto">
            <LanguageSwitcher />
          </div>
        </div>
      </header>
    </>
  );
}
