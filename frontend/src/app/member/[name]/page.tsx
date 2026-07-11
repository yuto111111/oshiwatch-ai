import { notFound } from "next/navigation";
import { Calendar, Sparkles } from "lucide-react";

import { apiFetch, ApiError } from "@/lib/api";
import ChatPanel from "@/components/ChatPanel";
import type { MemberDetail } from "@/types/summary";

type Props = { params: { name: string } };

function formatMonthDay(isoDate: string): { month: string; day: string } {
  const d = new Date(isoDate);
  return { month: `${d.getMonth() + 1}月`, day: `${d.getDate()}` };
}

export default async function MemberPage({ params }: Props) {
  let detail: MemberDetail;
  try {
    detail = await apiFetch<MemberDetail>(`/api/summaries/members/${params.name}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const { member, summaries, events } = detail;
  const latestSummary = summaries[0];
  const color = member.color ?? "#0EA5E9";

  return (
    <main>
      {/* ヒーローバナー */}
      <div
        className="relative overflow-hidden text-white"
        style={{ background: `linear-gradient(135deg, ${color}, #0C4A6E)` }}
      >
        <span className="absolute -right-4 -bottom-8 text-[10rem] font-black text-white/10 leading-none select-none">
          {member.name.charAt(0)}
        </span>
        <div className="max-w-3xl mx-auto px-4 py-10 relative">
          <p className="text-sm text-white/80 mb-1">Snow Man</p>
          <h1 className="text-3xl font-bold">{member.name}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 今日のまとめ */}
        <section className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-800">今日のまとめ</h2>
          </div>

          {latestSummary ? (
            <>
              <p className="text-xs text-gray-400 mb-2">{latestSummary.date}</p>
              <p className="text-gray-600">{latestSummary.summary}</p>

              {latestSummary.bullets.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {latestSummary.bullets.map((bullet) => (
                    <li key={bullet} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-primary">•</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}

              {latestSummary.sources.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {latestSummary.sources.map((source) => (
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
            </>
          ) : (
            <p className="text-gray-400">（まだサマリーがありません）</p>
          )}
        </section>

        {/* AI チャット (推し活AI 本家と同じくサマリ直下に配置) */}
        <section className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-3">AI に質問する</h2>
          <ChatPanel memberName={member.name_en} memberDisplayName={member.name} />
        </section>

        {/* 予定一覧 */}
        <section className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-800">大事な予定</h2>
          </div>
          {events.length === 0 ? (
            <p className="text-gray-400">（予定はまだありません）</p>
          ) : (
            <ul className="space-y-2">
              {events.map((e) => {
                const { month, day } = formatMonthDay(e.event_date);
                return (
                  <li
                    key={e.id}
                    className="flex items-center gap-4 bg-surface rounded-lg px-3 py-2.5"
                  >
                    <div className="shrink-0 text-center w-12">
                      <p className="text-[10px] text-gray-400 leading-none">{month}</p>
                      <p className="text-lg font-bold text-gray-700 leading-tight">{day}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{e.title}</p>
                      {e.description && (
                        <p className="text-xs text-gray-500 truncate">{e.description}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* サマリー履歴 */}
        {summaries.length > 1 && (
          <section className="card p-6">
            <h2 className="text-lg font-bold text-gray-700 mb-3">サマリー履歴</h2>
            <ul className="space-y-3">
              {summaries.slice(1).map((s) => (
                <li key={s.date} className="border-b border-gray-100 pb-2 last:border-0">
                  <p className="text-xs text-gray-400 mb-1">{s.date}</p>
                  <p className="text-sm text-gray-600">{s.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
