import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Sparkles, Heart } from "lucide-react";

import { apiFetch, ApiError } from "@/lib/api";
import ChatPanel from "@/components/ChatPanel";
import type { DashboardResponse } from "@/types/user";

type Props = { params: { userId: string } };

function formatMonthDay(isoDate: string): { month: string; day: string } {
  const d = new Date(isoDate);
  return { month: `${d.getMonth() + 1}月`, day: `${d.getDate()}` };
}

export default async function DashboardPage({ params }: Props) {
  let data: DashboardResponse;
  try {
    data = await apiFetch<DashboardResponse>(
      `/api/users/${params.userId}/dashboard`,
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const { user, followed } = data;

  return (
    <main>
      {/* ヒーロー */}
      <div className="bg-gradient-to-br from-accent to-primary text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-sm text-white/80 mb-1 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" /> あなたの推し活ダッシュボード
          </p>
          <h1 className="text-3xl font-bold mb-2">{user.display_name}</h1>
          <p className="text-white/90 text-sm">
            フォロー中: {followed.length} 名
            {user.interests.length > 0 && (
              <> ・ 関心: {user.interests.join(" / ")}</>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* フォロー中の推しサマリー */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">
            今日の推しハイライト
          </h2>
          {followed.length === 0 ? (
            <p className="text-gray-400">
              （フォロー中の推しがいません。 メンバー一覧から追加してください）
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {followed.map((f) => (
                <Link
                  key={f.member.id}
                  href={`/member/${f.member.name_en}`}
                  className="card-hover p-5 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-11 h-11 shrink-0 rounded-full text-white font-bold flex items-center justify-center"
                      style={{
                        backgroundColor: f.member.color ?? "#0EA5E9",
                      }}
                    >
                      {f.member.name.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-800 truncate">
                        {f.member.name}
                      </h3>
                      {f.date && (
                        <p className="text-xs text-gray-400">{f.date}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-3 min-h-[3.6rem]">
                    {f.summary || "（今日のサマリーはまだありません）"}
                  </p>

                  {f.bullets.length > 0 && (
                    <ul className="space-y-0.5">
                      {f.bullets.slice(0, 2).map((b, i) => (
                        <li
                          key={i}
                          className="text-xs text-gray-500 flex gap-1.5"
                        >
                          <span className="text-primary">•</span>
                          <span className="line-clamp-1">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {f.next_event && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-surface rounded-md px-2 py-1.5">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {f.next_event.event_date} {f.next_event.title}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* AI チャット (フォロー中の推し全員をコンテキストに) */}
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-800">AI に質問する</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            フォロー中の推し全員の情報をもとに、推し活AIが回答します
          </p>
          <ChatPanel
            userId={user.id}
            displayName={`${user.display_name}の推し活`}
          />
        </section>
      </div>
    </main>
  );
}
