// Gemini が生成した bullet には末尾に "(出典: https://...)" 形式で
// URL が埋め込まれており、長い Google News redirect URL がカードからはみ出す。
// 表示時に URL を切り離して「情報元: <サイト名>」に置き換えるヘルパ。

const SOURCE_SUFFIX_RE = /\s*[（(]\s*出典[：:]\s*(https?:\/\/[^）)\s]+)\s*[）)]\s*$/;

type ParsedBullet = {
  text: string;
  sourceUrl: string | null;
  sourceLabel: string | null;
};

/**
 * Google News のリダイレクト URL や生 URL から、ユーザに見せる「情報元」ラベルを推定する。
 *  - news.google.com → "ニュース"
 *  - twitter.com / x.com → "SNS"
 *  - youtube.com → "動画"
 *  - wikipedia.org → "Wikipedia"
 *  - その他 → ドメイン (www. を剥がす)
 */
export function labelForUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("news.google.com")) return "ニュース";
    if (host === "twitter.com" || host === "x.com") return "SNS";
    if (host.includes("youtube.com") || host === "youtu.be") return "動画";
    if (host.endsWith("wikipedia.org")) return "Wikipedia";
    return host;
  } catch {
    return "情報元";
  }
}

export function parseBullet(raw: string): ParsedBullet {
  if (!raw) return { text: "", sourceUrl: null, sourceLabel: null };
  const m = raw.match(SOURCE_SUFFIX_RE);
  if (!m) return { text: raw.trim(), sourceUrl: null, sourceLabel: null };
  return {
    text: raw.replace(SOURCE_SUFFIX_RE, "").trim(),
    sourceUrl: m[1],
    sourceLabel: labelForUrl(m[1]),
  };
}
