import type { DailySummary as DailySummaryType } from "@/types";
import { safeUrl } from "@/lib/utils/safe-url";
import { labelForUrl, parseBullet } from "@/lib/utils/bullet";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";

// ISO 8601 を 「2026/5/30 14:30」形式に整形 (JST 表示)。
function formatUpdatedAt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  // 日本ローカル表示。年/月/日 HH:mm を組み立て (Intl は環境差があるため手動)
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${hh}:${mm}`;
}

export default function DailySummary({
  summary,
}: {
  summary: DailySummaryType | null;
}) {
  const updatedAt = formatUpdatedAt(summary?.updated_at);
  return (
    <section className="card p-5">
      <h2 className="section-title flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-primary">&#10024;</span>
        <span>今日のまとめ</span>
        {updatedAt && (
          <span className="text-xs font-normal text-gray-400">
            ({updatedAt} 更新)
          </span>
        )}
        {summary?.confidence_level && (
          <ConfidenceBadge level={summary.confidence_level} />
        )}
      </h2>
      {summary ? (
        <>
          <p className="text-sm text-gray-700 mb-3">{summary.summary}</p>
          <ul className="space-y-2 mb-4">
            {summary.bullets.map((b, i) => {
              // 情報元リンクの決定ロジック (優先順):
              // 1. bullet 末尾に (出典: URL) が埋め込まれていればそれを使う
              //    (新プロンプト仕様、日次 cron 更新後に反映)
              // 2. bullets と sources の件数が一致していれば
              //    「i 番目 bullet の情報元 = i 番目 sources」と推定
              //    (Gemini は通常この順で生成、既存 DB 対応の暫定 fallback)
              const parsed = parseBullet(b);
              let sourceUrl = parsed.sourceUrl;
              let sourceLabel = parsed.sourceLabel;
              if (
                !sourceUrl &&
                summary.bullets.length === summary.sources.length &&
                summary.sources[i]?.url
              ) {
                sourceUrl = summary.sources[i].url;
                sourceLabel = labelForUrl(sourceUrl);
              }
              return (
                <li key={i} className="flex gap-2 text-sm text-gray-600">
                  <span className="text-primary mt-0.5 shrink-0">&#9679;</span>
                  <span className="break-words">
                    {parsed.text}
                    {sourceUrl && sourceLabel && (
                      <>
                        {" "}
                        <a
                          href={safeUrl(sourceUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-[11px] text-primary hover:underline underline-offset-2"
                        >
                          (情報元: {sourceLabel})
                        </a>
                      </>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-2">
            {summary.sources.map((s, i) => (
              <a
                key={i}
                href={safeUrl(s.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline bg-primary/5 px-2 py-1 rounded"
              >
                {s.title}
              </a>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400">
          まだ今日のまとめはありません。
        </p>
      )}
    </section>
  );
}
