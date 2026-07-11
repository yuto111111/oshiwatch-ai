// Google Analytics 4 (GA4) ヘルパ。
// build 時に NEXT_PUBLIC_GA_MEASUREMENT_ID が注入されていれば有効化される。
// 未設定 (ローカル / プレビュー) では no-op で安全に動く。

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

export const isGAEnabled = (): boolean =>
  typeof window !== "undefined" && !!GA_MEASUREMENT_ID && typeof window.gtag === "function";

/** GA4 にページビューを送信 (SPA 遷移時) */
export function gaPageView(path: string): void {
  if (!isGAEnabled()) return;
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: path });
}

/** GA4 にカスタムイベントを送信
 *  例: gaEvent('chat_send', { question_len: 42 })
 *      gaEvent('affiliate_click', { provider: 'rakuten', entity_id: 'xxx' })
 */
export function gaEvent(
  action: string,
  params: Record<string, string | number | boolean | undefined> = {},
): void {
  if (!isGAEnabled()) return;
  // undefined を除く (GA4 は undefined を string "undefined" にしてしまう)
  const cleaned: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) cleaned[k] = v;
  }
  window.gtag("event", action, cleaned);
}

// グローバル型 (gtag は <Script> でロードされる)
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}
