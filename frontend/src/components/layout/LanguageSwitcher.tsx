"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  LOCALE_LABELS,
  LOCALE_SHORT,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n/locales";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function handleSelect(next: Locale) {
    setOpen(false);
    if (next !== locale) setLocale(next);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language.label")}
        title={t("language.label")}
        className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 hover:text-primary border border-gray-200 rounded-lg"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.6 9h16.8M3.6 15h16.8M11.5 3a16.5 16.5 0 000 18M12.5 3a16.5 16.5 0 010 18"
          />
          <circle cx="12" cy="12" r="9" strokeWidth={2} />
        </svg>
        <span>{LOCALE_SHORT[locale]}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("language.label")}
          className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1 text-sm"
        >
          {SUPPORTED_LOCALES.map((code) => (
            <li key={code}>
              <button
                type="button"
                onClick={() => handleSelect(code)}
                role="option"
                aria-selected={code === locale}
                className={`w-full text-left px-3 py-1.5 hover:bg-surface ${
                  code === locale ? "text-primary font-medium" : "text-gray-600"
                }`}
              >
                {LOCALE_LABELS[code]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
