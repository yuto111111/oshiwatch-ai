import Link from "next/link";

import type { GlobalTopics } from "@/types";
import { formatDate } from "@/lib/utils/format";
import { parseBullet } from "@/lib/utils/bullet";
import { entityHref } from "@/lib/utils/entity-url";

interface TopicsListProps {
  topics: GlobalTopics;
}

export default function TopicsList({ topics }: TopicsListProps) {
  if (!topics.topics || topics.topics.length === 0) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="mb-5 flex items-baseline justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
            グローバルトピック
          </p>
          <h2 className="text-lg font-bold text-gray-900">
            今日の人気推し
          </h2>
        </div>
        <p className="text-xs text-gray-500">{formatDate(topics.date)}</p>
      </div>

      <ul className="space-y-3">
        {topics.topics.map((t) => (
          <li key={t.entity_id}>
            <Link
              href={entityHref(t)}
              className="flex gap-3 items-start p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="flex-shrink-0">
                {/* 著作権上の理由で本物の推し画像は載せられないため、
                    名前の頭 1 文字を表示する。スタイル (グラデ / ソリッド /
                    アウトライン / ミニマル) はユーザーの card_style 設定に追従。 */}
                <div className="oshi-accent-avatar w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl">
                  {t.canonical_name.slice(0, 1)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 mb-1 truncate">
                  {t.canonical_name}
                </p>
                <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                  {t.summary}
                </p>
                {t.bullets && t.bullets.length > 0 && (
                  <ul className="space-y-0.5">
                    {t.bullets.slice(0, 2).map((b, idx) => {
                      const parsed = parseBullet(b);
                      return (
                        <li
                          key={idx}
                          className="text-xs text-gray-600 line-clamp-1 flex gap-1.5"
                        >
                          <span className="text-primary flex-shrink-0">•</span>
                          <span className="min-w-0">
                            {parsed.text}
                            {parsed.sourceLabel && (
                              <span className="text-gray-400 ml-1">
                                ({parsed.sourceLabel})
                              </span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
