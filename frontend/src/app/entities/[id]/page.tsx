// ハッカソン用推し詳細ページ (auth / community / purchase / travel すべて撤去)。
// 本家 HeroSection + DailySummary は使い回し、その下に AIChatPanel を配置。

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import HeroSection from "@/components/entity/HeroSection";
import DailySummaryComponent from "@/components/entity/DailySummary";
import AIChatPanel from "@/components/dashboard/AIChatPanel";
import { fetchEntity, fetchDailySummary } from "@/lib/api/entities";

type Props = { params: { id: string } };

export default async function EntityDetailPage({ params }: Props) {
  let entity;
  try {
    entity = await fetchEntity(params.id);
  } catch {
    notFound();
  }

  let summary = null;
  try {
    summary = await fetchDailySummary(params.id);
  } catch {
    summary = null;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={14} />
          トップに戻る
        </Link>
      </div>

      <HeroSection
        entity={entity}
        isFollowing={false}
        isLoggedIn={false}
        followLoading={false}
        onFollowToggle={() => {}}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {summary ? (
          <DailySummaryComponent summary={summary} />
        ) : (
          <section className="card p-5 text-gray-400 text-sm">
            まだ今日のまとめはありません。
          </section>
        )}

        <section className="card p-5">
          <div className="mb-3">
            <h3 className="section-title-accent !mb-1">AI に質問する</h3>
            <p className="text-xs text-gray-500">
              {entity.canonical_name} について気になることを聞いてみてください。
            </p>
          </div>
          <AIChatPanel
            entityId={entity.id}
            entityName={entity.canonical_name}
          />
        </section>
      </main>
    </div>
  );
}
