/**
 * 対応ロケール定義（BCP 47 準拠）。
 *
 * - `ja`        : 日本語（デフォルト）
 * - `en`        : 英語
 * - `ko`        : 韓国語
 * - `zh-Hans`   : 簡体中文（中国大陸表記）
 * - `zh-Hant`   : 繁體中文（台湾・香港表記）
 *
 * `entities.names_jsonb` / `descriptions_jsonb` のキーや
 * `user_profiles.locale` の許容値とも揃えること。
 */
export const SUPPORTED_LOCALES = [
  "ja",
  "en",
  "ko",
  "zh-Hans",
  "zh-Hant",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ja";

export const LOCALE_LABELS: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
  ko: "한국어",
  "zh-Hans": "简体中文",
  "zh-Hant": "繁體中文",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  ja: "JA",
  en: "EN",
  ko: "KO",
  "zh-Hans": "简",
  "zh-Hant": "繁",
};

/** Cookie 名: ヘッダー言語切替の永続化 */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

/**
 * 任意の文字列をサポート対象ロケールに正規化する。
 *
 * 既存データ移行のため `zh` は `zh-Hans` に丸める（中国大陸が最大セグメント想定）。
 */
export function normalizeLocale(input: unknown): Locale {
  if (typeof input !== "string") return DEFAULT_LOCALE;
  if (input === "zh") return "zh-Hans";
  // ブラウザの Accept-Language などで `zh-CN` / `zh-TW` が来た場合の救済
  if (input.toLowerCase().startsWith("zh-cn")) return "zh-Hans";
  if (input.toLowerCase().startsWith("zh-tw")) return "zh-Hant";
  if (input.toLowerCase().startsWith("zh-hk")) return "zh-Hant";
  if (isLocale(input)) return input;
  return DEFAULT_LOCALE;
}

/**
 * `entities.names_jsonb` / `descriptions_jsonb` から、
 * 指定ロケールの値を取得する。なければ ja → en の順でフォールバック。
 */
export function pickLocalized(
  dict: Record<string, string> | null | undefined,
  locale: Locale,
  fallback?: string,
): string {
  if (!dict) return fallback ?? "";
  const value = dict[locale];
  if (value && value.trim()) return value;
  if (locale === "zh-Hant" && dict["zh-Hans"]) return dict["zh-Hans"];
  if (locale === "zh-Hans" && dict["zh-Hant"]) return dict["zh-Hant"];
  if (dict.ja) return dict.ja;
  if (dict.en) return dict.en;
  return fallback ?? "";
}
