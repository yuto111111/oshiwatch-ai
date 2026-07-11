// ハッカソン用ホーム: 本家 UI パターンを踏襲しつつ auth / trending / community を撤去。
// oshiwatch-ai バックエンドから Snow Man の今日のまとめを SSR で取得して表示する。

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import TopicsList from "@/components/dashboard/TopicsList";
import { fetchHomeTopics } from "@/lib/api/entities";
import type { GlobalTopics } from "@/types";

const BRAND_SKY = "#0EA5E9";

function formatToday(): string {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default async function HomePage() {
  let topics: GlobalTopics | null = null;
  try {
    topics = await fetchHomeTopics();
  } catch {
    topics = null;
  }

  const todayStr = formatToday();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${BRAND_SKY}22 0%, #ffffff 60%, #F0F7FB 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 lg:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: BRAND_SKY }}
              >
                推し活AI · {todayStr}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-gray-900">
                推し活AI
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-xl">
                推しの情報まとめと <strong>AI チャット</strong> で、
                <strong>推し活</strong> をもっと楽に。
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-900 hover:underline underline-offset-4 self-center"
                >
                  推し活AI とは
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          <div
            className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full bg-white px-4 py-2 mt-6 text-xs font-semibold shadow-sm border border-gray-200"
          >
            <Sparkles size={13} className="text-primary" />
            <span className="text-gray-600">対応中の推し</span>
            <span className="font-bold" style={{ color: BRAND_SKY }}>
              Snow Man 9 名
            </span>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 pb-16 pt-8 space-y-12">
        {topics && topics.topics.length > 0 && <TopicsList topics={topics} />}
      </main>
    </div>
  );
}
