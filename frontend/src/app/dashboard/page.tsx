// ダッシュボード: ログイン不要でデモアクセス可。
// デフォルトでフォロー中の推し 3 名を表示し、AI チャットも横断コンテキストで動く。

import Link from "next/link";
import { Sparkles, ArrowRight, Heart } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { findOshi } from "@/lib/data/oshi-list";

const BRAND_SKY = "#0EA5E9";

// ログインなしのため、デモユーザーのプリセットを固定表示
// (画面上に "サンプル" などの言葉は出さない、通常のダッシュボードとして扱う)
const DEFAULT_USER_ID = "demo_uta";

type FollowedMember = {
  member: {
    id: string;
    name: string;
    name_en: string;
    image_url: string | null;
    color: string | null;
  };
  summary: string | null;
  date: string | null;
  bullets: string[];
  next_event: {
    id: string;
    title: string;
    event_date: string;
  } | null;
};

type DashboardResponse = {
  user: {
    id: string;
    display_name: string;
    followed_member_ids: string[];
    interests: string[];
  };
  followed: FollowedMember[];
};

export const metadata = {
  title: "ダッシュボード",
  description: "フォロー中の推しの今日のまとめを一覧で。",
};

export default async function DashboardPage() {
  let data: DashboardResponse | null = null;
  try {
    data = await apiFetch<DashboardResponse>(
      `/api/users/${DEFAULT_USER_ID}/dashboard`,
    );
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center text-gray-500">
        ダッシュボードの読み込みに失敗しました。 しばらく経ってから再度お試しください。
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${BRAND_SKY}22 0%, #ffffff 60%, #F0F7FB 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: BRAND_SKY }}
          >
            <Heart size={11} className="inline mr-1" /> あなたの推し活
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900">
            推し活ダッシュボード
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-xl">
            フォロー中の推し {data.followed.length} 名の今日のまとめと、
            推しごとの AI チャットへのショートカット。
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-gray-900">今日の推しハイライト</h2>
          <Link
            href="/search"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            他の推しを探す <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.followed.map((f) => {
            const oshi = findOshi(f.member.name_en);
            const color = f.member.color ?? oshi?.color ?? BRAND_SKY;
            return (
              <Link
                key={f.member.id}
                href={`/entities/${f.member.name_en}`}
                className="group card-hover p-5 flex flex-col gap-3 border border-gray-100 rounded-2xl bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ borderColor: `${color}33` }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-11 h-11 shrink-0 rounded-full text-white font-bold flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    {f.member.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 truncate">
                      {f.member.name}
                    </p>
                    {oshi && (
                      <p className="text-xs text-gray-500">{oshi.group}</p>
                    )}
                  </div>
                  {f.date && (
                    <p className="text-[10px] text-gray-400">{f.date}</p>
                  )}
                </div>

                <p className="text-sm text-gray-700 line-clamp-3 min-h-[3.6rem]">
                  {f.summary || "（今日のまとめはまだありません）"}
                </p>

                {f.bullets.length > 0 && (
                  <ul className="space-y-0.5">
                    {f.bullets.slice(0, 2).map((b, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-600 flex gap-1.5"
                      >
                        <span className="text-primary">•</span>
                        <span className="line-clamp-1">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-primary font-bold flex items-center gap-1">
                    <Sparkles size={12} /> 詳細と AI チャットを開く
                  </span>
                  <ArrowRight size={12} className="text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
