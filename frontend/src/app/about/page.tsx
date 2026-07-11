// 推し活AI サービス紹介 LP (SEO ランディングページ)。
//
// 目的:
//   Google 検索「推し活AI」で 1 位を取るためのキーワード濃度と、
//   Knowledge Panel / FAQ Rich Result を狙う JSON-LD を仕込む静的ページ。
//
// 設計:
//   - Server Component として generateMetadata + JSON-LD を SSR 出力
//   - H1 に「推し活AI とは」を明示
//   - キーワード「推し活AI」「推し活」「AI 推し活」「Z 世代」を自然に反復
//   - FAQ セクションを FAQPage schema と一緒に出す
//   - 内部リンクでトップ / 検索 / ダッシュボードへ誘導

import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import {
  buildFaqJsonLd,
  buildWebApplicationJsonLd,
} from "@/lib/seo/json-ld";

const SITE_BASE = "https://oshikatsu-ai.com";

export const metadata: Metadata = {
  title: "推し活AI とは",
  description:
    "推し活AI (oshikatsu-ai.com) は、アイドル・K-POP などの推しの動向、あなたの推し活の活動記録、チケットや予定の管理を一つにまとめる推し活アプリです。",
  keywords: [
    "推し活AI",
    "推し活AIとは",
    "推し活 AI",
    "推し活アプリ",
    "AI 推し活",
    "推し管理アプリ",
    "推し活サポート",
    "Z 世代 推し活",
    "推しカツAI",
  ],
  alternates: {
    canonical: `${SITE_BASE}/about`,
  },
  openGraph: {
    title: "推し活AI とは — 推しの最新情報を AI が毎日まとめる推し活アプリ",
    description:
      "推し活AI は AI が推しの最新情報を自動収集する Z 世代向けアプリ。多ジャンル対応、無料で始められます。",
    url: `${SITE_BASE}/about`,
    type: "website",
  },
};

// FAQ (FAQPage schema と本文の両方で使う。同じ Q&A を出すと Google が
// リッチリザルトとして拾いやすくなる)
const FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "推し活AI は無料で使えますか？",
    answer:
      "はい。 推し活AI (oshikatsu-ai.com) は基本機能を無料で提供しています。 推しの情報収集・AI 要約・ダッシュボードなど、主要な機能は登録後すぐに全て使えます。 将来的にプレミアム機能を有料で提供する予定ですが、無料版だけで日々の推し活に十分活用できます。",
  },
  {
    question: "推し活AI はどんな推しに対応していますか？",
    answer:
      "アイドル・K-POP アーティスト・VTuber・音楽アーティスト・俳優・スポーツ選手など、幅広いジャンルに対応しています。 STARTO ENTERTAINMENT (旧ジャニーズ) 系、K-POP 主要事務所、ホロライブ / にじさんじ 等の VTuber、Jリーグ / MLB 等のスポーツ選手まで、ユーザーが登録した推しに合わせて AI が情報を集めます。",
  },
  {
    question: "推し活AI と他の推し活アプリの違いは何ですか？",
    answer:
      "推し活AI の最大の特徴は「AI が自動で推しの最新情報を集めてまとめる」点です。 他の推し活アプリは主に自分で情報を記録・整理する機能中心ですが、推し活AI は Google 検索や公式サイトを AI が横断してファンにとって重要なニュースだけを毎日ピックアップします。 忙しいファンでも「今日の推しの動き」を数秒で把握できます。",
  },
  {
    question: "推し活AI の登録に必要な情報は？",
    answer:
      "メールアドレスとパスワードだけで無料登録できます。 電話番号や本名の入力は不要です。 プライバシー保護を重視し、必要最小限の情報のみを扱います。",
  },
  {
    question: "推し活AI は安全に使えますか？",
    answer:
      "はい。 推し活AI は個人情報保護法および業界標準のセキュリティ実装に基づいて運営しています。 通信は全て HTTPS 暗号化、パスワードはハッシュ化保存、認証は Supabase Auth を採用しています。 詳細はプライバシーポリシーをご確認ください。",
  },
  {
    question: "推し活AI は誰が作っていますか？",
    answer:
      "推し活AI は Z 世代のファンをターゲットにした AI 推し活サポートアプリとして開発されています。 「推しと過ごす時間をもっと豊かに」をミッションに、AI 技術と現代のファン文化を融合させた新しい形の推し活体験を提供します。",
  },
  {
    question: "スマートフォンから使えますか？",
    answer:
      "はい。 推し活AI (oshikatsu-ai.com) はスマートフォン Safari / Chrome から快適に利用できるレスポンシブ Web アプリです。 ネイティブアプリのインストールは不要で、ブラウザからそのまま使えます。 ホーム画面に追加すればアプリのように使うこともできます。",
  },
];

export default function AboutPage() {
  const faqJsonLd = buildFaqJsonLd(FAQS);
  const webAppJsonLd = buildWebApplicationJsonLd();

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={[faqJsonLd, webAppJsonLd]} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-3">
            About · 推し活AI
          </p>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
            推し活AI とは
          </h1>
          <p className="text-sm sm:text-base text-gray-700 mt-4 leading-relaxed">
            <strong>推し活AI</strong> (oshikatsu-ai.com) は、
            アイドル・K-POP などの<strong>推しの動向</strong>、
            あなたの推し活の活動記録、チケットや予定の管理を一つにまとめる推し活アプリです。
            忙しい毎日でも「今日の推し」を数秒で把握できます。
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 transition"
            >
              推しを探す
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-sky-300 text-sky-700 font-semibold text-sm hover:bg-sky-50 transition"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </section>

      {/* 主要機能 */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
          推し活AI でできること
        </h2>
        <div className="space-y-6">
          <Feature
            emoji="✨"
            title="AI が推しの最新情報を毎日自動で集める"
            body="推し活AI の中核機能。 登録した推しについて、AI が Google 検索・公式サイト・ニュースを横断して、ファンにとって重要な情報だけを毎日ピックアップします。 「今日の推しの動き」を数秒で把握できます。"
          />
          <Feature
            emoji="📅"
            title="ライブ・イベント・グッズを一元管理"
            body="推しのライブ日程、新譜発売、グッズ販売、雑誌掲載を推し活AI のダッシュボードで一元管理。 うっかり見逃しをゼロにします。"
          />
          <Feature
            emoji="🎁"
            title="遠征・グッズの購入をワンタップ"
            body="ライブ遠征の宿探し・航空券・公式グッズの購入リンクを推し活AI から直接開けます。 楽天トラベル・じゃらん・Trip.com・Amazon・楽天市場・アニメイト等に対応。"
          />
          <Feature
            emoji="👥"
            title="推し活コミュニティ"
            body="同じ推しを推す他のファンと交流できるコミュニティ機能。 ライブレポートや感想を共有し、推し活仲間と繋がれます。"
          />
          <Feature
            emoji="📊"
            title="推し活の家計簿・履歴"
            body="チケット・グッズ・遠征費を記録し、月次で推し活支出を可視化。 大切な思い出のアーカイブとしても機能します。"
          />
        </div>
      </section>

      {/* 対応ジャンル */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            推し活AI が対応する推しジャンル
          </h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            推し活AI は特定ジャンルに縛られない、あらゆる「推し」に対応する
            汎用推し活サポートアプリです。 以下は代表的な対応ジャンルの一例です。
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {[
              "STARTO (旧ジャニーズ)",
              "K-POP アーティスト",
              "VTuber (ホロライブ / にじさんじ)",
              "音楽アーティスト",
              "俳優・声優",
              "アイドルグループ",
              "スポーツ選手 (MLB / NPB / Jリーグ)",
              "アニメキャラクター",
              "地下アイドル",
            ].map((g) => (
              <div
                key={g}
                className="bg-white px-4 py-2.5 rounded-lg border border-gray-200 text-gray-800"
              >
                {g}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ミッション */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          推し活AI のミッション
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          <strong>ファンと推しを、AI とテクノロジーでつなぐ</strong>。 それが
          推し活AI のミッションです。
        </p>
        <p className="text-sm text-gray-700 mt-4 leading-relaxed">
          推し活はもはや一部のファンの趣味ではなく、Z 世代を中心に日常の一部と
          なっています。 推しの情報は各種 SNS・公式サイト・ファンサイトに散らばり、
          全てを追いかけるのは容易ではありません。 推し活AI は AI 技術を活用して
          この「情報の壁」を取り除き、ファンが本当に大切にしたい「推しとの時間」に
          集中できる世界を作ります。
        </p>
      </section>

      {/* FAQ (FAQPage schema と本文で二重出力) */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
            推し活AI に関するよくある質問
          </h2>
          <div className="space-y-5">
            {FAQS.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                  Q. {faq.question}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  A. {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-10 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
          今日から推し活AI で始める
        </h2>
        <p className="text-sm text-gray-700 mb-6">
          無料で登録して、AI があなたの推し活を毎日サポートします。
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 transition"
          >
            無料で始める
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
          >
            トップに戻る
          </Link>
        </div>
      </section>
    </div>
  );
}

function Feature({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="text-3xl shrink-0" aria-hidden>
        {emoji}
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
