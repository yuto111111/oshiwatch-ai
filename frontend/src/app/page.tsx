import Link from "next/link";
import { Calendar, Sparkles, Heart } from "lucide-react";

import { apiFetch } from "@/lib/api";
import type { GroupSummary, MemberSummaries } from "@/types/summary";

export default async function Home() {
  const [groupSummary, memberSummaries] = await Promise.all([
    apiFetch<GroupSummary>("/api/summaries/group/today"),
    apiFetch<MemberSummaries>("/api/summaries/members"),
  ]);

  return (
    <main>
      {/* ヒーローバナー */}
      <div className="bg-gradient-to-br from-accent to-primary text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-sm text-white/80 mb-1">推し活AI</p>
          <h1 className="text-3xl font-bold mb-2">推し活AI</h1>
          <p className="text-white/90 max-w-2xl">
            アイドル・K-POP など<strong>推しの動向</strong>、あなたの推し活の活動記録、
            チケットや予定の管理を推し活AI一つで。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/dashboard/demo_uta"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/95 text-primary text-sm font-semibold px-4 py-2 hover:bg-white transition-colors"
            >
              <Heart className="w-3.5 h-3.5" />
              Uta さんの推し活を体験
            </Link>
            <Link
              href="/dashboard/demo_ren"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 text-white text-sm font-semibold px-4 py-2 hover:bg-white/30 border border-white/30 transition-colors"
            >
              箱推しダッシュボード
            </Link>
            <Link
              href="/dashboard/demo_sho"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 text-white text-sm font-semibold px-4 py-2 hover:bg-white/30 border border-white/30 transition-colors"
            >
              単推しダッシュボード
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* グループ全体サマリー */}
        <section className="card p-6 mb-8">
          <div className="flex items-start gap-4">
            <span className="w-11 h-11 shrink-0 rounded-full bg-accent text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-gray-800 mb-1">グループ全体</h2>
              <p className="text-gray-600">
                {groupSummary.summary || "（サマリーは準備中です）"}
              </p>

              {groupSummary.bullets.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {groupSummary.bullets.map((bullet) => (
                    <li key={bullet} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-primary">•</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}

              {groupSummary.sources.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {groupSummary.sources.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-primary bg-secondary/40 hover:bg-secondary/70 rounded-lg px-3 py-1.5 transition-colors truncate"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* メンバーカード一覧 */}
        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-4">メンバー別</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {memberSummaries.members.map((member) => (
              <Link
                key={member.id}
                href={`/member/${member.name_en}`}
                className="card-hover p-4 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-10 h-10 shrink-0 rounded-full text-white font-bold flex items-center justify-center"
                    style={{ backgroundColor: member.color ?? "#0EA5E9" }}
                  >
                    {member.name.charAt(0)}
                  </span>
                  <h3 className="font-bold text-gray-800 truncate">{member.name}</h3>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
                  {member.summary || "（情報準備中）"}
                </p>

                {member.next_event && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-surface rounded-md px-2 py-1.5">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {member.next_event.event_date} {member.next_event.title}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
