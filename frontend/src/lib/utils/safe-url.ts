/**
 * 外部 URL を `<a href>` に渡す前にスキームをチェックする。
 *
 * `javascript:` や `data:` などの実行系スキームを含む URL を弾き、
 * `https?:` `mailto:` `tel:` のみを許可する。
 *
 * 値はクローラ収集 / LLM 出力 / Admin 入力など信頼境界を跨ぐため、
 * すべての外部 URL リンクは本ヘルパー経由で描画する。
 */
const SAFE_PROTOCOLS = new Set([
  "http:",
  "https:",
  "mailto:",
  "tel:",
]);

const FALLBACK = "#";

export function safeUrl(input: string | null | undefined): string {
  if (!input) return FALLBACK;
  const trimmed = input.trim();
  if (!trimmed) return FALLBACK;

  // 相対パス（/, ./, ../）はアプリ内遷移なので許可
  if (trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../")) {
    // ただし //evil.com (protocol-relative) はオープンリダイレクト経路になるので弾く
    if (trimmed.startsWith("//")) return FALLBACK;
    return trimmed;
  }

  // フラグメントのみ
  if (trimmed.startsWith("#")) return trimmed;

  try {
    const url = new URL(trimmed);
    if (!SAFE_PROTOCOLS.has(url.protocol.toLowerCase())) {
      return FALLBACK;
    }
    return url.toString();
  } catch {
    return FALLBACK;
  }
}
