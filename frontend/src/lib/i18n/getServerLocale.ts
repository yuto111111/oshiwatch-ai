import { cookies } from "next/headers";
import { LOCALE_COOKIE, normalizeLocale, type Locale } from "./locales";

/**
 * Server Component（layout / page）から呼び出して、
 * SSR 時の初期ロケールを Cookie から決定する。
 *
 * Cookie 未設定なら `ja` にフォールバック。Accept-Language の解釈は
 * 初期表示の安定性を優先し、ここでは行わない（ユーザー設定が優先）。
 */
export function getServerLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return normalizeLocale(value);
}
