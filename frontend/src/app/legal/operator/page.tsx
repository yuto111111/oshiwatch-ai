import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "運営者情報 | Oshi-Katsu-AI",
  description:
    "Oshi-Katsu-AI の運営者情報・お問い合わせ先・関連法令への対応について。",
};

export default function OperatorPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">運営者情報</h1>
        <p className="text-sm text-gray-500">最終更新日: 2026年5月9日</p>
      </header>

      <article className="space-y-8 text-sm leading-relaxed text-gray-700">
        <section className="card p-6 space-y-3">
          <h2 className="text-lg font-bold text-gray-800">サービス概要</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 sm:gap-x-4">
            <dt className="font-bold text-gray-600">サービス名</dt>
            <dd className="sm:col-span-2">Oshi-Katsu-AI</dd>

            <dt className="font-bold text-gray-600">URL</dt>
            <dd className="sm:col-span-2">
              <a
                href="https://oshikatsu-ai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                https://oshikatsu-ai.com
              </a>
            </dd>

            <dt className="font-bold text-gray-600">提供開始</dt>
            <dd className="sm:col-span-2">2026年</dd>

            <dt className="font-bold text-gray-600">サービス内容</dt>
            <dd className="sm:col-span-2">
              推し（アイドル / VTuber / アーティスト / アスリート等）に関する情報の集約・AI 要約・コミュニティ機能を提供する Web サービス
            </dd>

            <dt className="font-bold text-gray-600">利用料金</dt>
            <dd className="sm:col-span-2">
              無料。広告およびアフィリエイトリンクによって収益化しています。
            </dd>
          </dl>
        </section>

        <section className="card p-6 space-y-3">
          <h2 className="text-lg font-bold text-gray-800">運営者</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 sm:gap-x-4">
            <dt className="font-bold text-gray-600">運営形態</dt>
            <dd className="sm:col-span-2">個人</dd>

            <dt className="font-bold text-gray-600">運営責任者</dt>
            <dd className="sm:col-span-2">
              氏名等の詳細はプライバシー保護のため非公開とし、必要に応じてお問い合わせ時に開示します。
            </dd>

            <dt className="font-bold text-gray-600">所在地</dt>
            <dd className="sm:col-span-2">
              東京都内（具体的な住所はお問い合わせ時に開示します）
            </dd>
          </dl>
        </section>

        <section className="card p-6 space-y-3">
          <h2 className="text-lg font-bold text-gray-800">お問い合わせ</h2>
          <p>
            本サービスに関するお問い合わせ、個人情報の開示・訂正・削除請求、利用規約に関するお問い合わせは、以下の窓口までご連絡ください。
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 sm:gap-x-4">
            <dt className="font-bold text-gray-600">お問い合わせ用メール</dt>
            <dd className="sm:col-span-2">
              <a
                href="mailto:contact@oshikatsu-ai.com"
                className="text-primary hover:underline"
              >
                contact@oshikatsu-ai.com
              </a>
              <p className="text-xs text-gray-400 mt-1">
                通常 1〜3 営業日以内に返信いたします。
              </p>
            </dd>

            <dt className="font-bold text-gray-600">著作権・権利侵害の報告</dt>
            <dd className="sm:col-span-2">
              <a
                href="mailto:abuse@oshikatsu-ai.com"
                className="text-primary hover:underline"
              >
                abuse@oshikatsu-ai.com
              </a>
            </dd>
          </dl>
        </section>

        <section className="card p-6 space-y-3">
          <h2 className="text-lg font-bold text-gray-800">広告・アフィリエイト</h2>
          <p>
            本サービスは、サービス運営費用に充当するため、以下のプログラムによる広告およびアフィリエイト収益を得ています。
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Google AdSense（広告配信）</li>
            <li>Amazon アソシエイト・プログラム</li>
            <li>楽天アフィリエイト</li>
          </ul>
          <p className="text-xs text-gray-500 bg-gray-50 rounded p-3">
            「Oshi-Katsu-AI は、Amazon.co.jp を宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazon アソシエイト・プログラムの参加者です。」
          </p>
          <p>
            広告およびアフィリエイトリンクの取扱いについての詳細は、{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              プライバシーポリシー
            </Link>
            {" "}をご覧ください。
          </p>
        </section>

        <section className="card p-6 space-y-3">
          <h2 className="text-lg font-bold text-gray-800">関連ドキュメント</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <Link href="/privacy" className="text-primary hover:underline">
                プライバシーポリシー
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-primary hover:underline">
                利用規約
              </Link>
            </li>
          </ul>
        </section>

        <section className="card p-6 space-y-3">
          <h2 className="text-lg font-bold text-gray-800">免責事項</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              本サービスに掲載される推しに関する情報は、外部の公開情報・AI による生成・ユーザーによる投稿等を含み、その正確性・完全性・最新性を保証するものではありません。
            </li>
            <li>
              本サービスから他のサイトへリンクすることがありますが、リンク先の内容について当方は責任を負いません。
            </li>
            <li>
              本サービスの利用により生じた損害について、当方は一切の責任を負いません。詳細は{" "}
              <Link href="/terms" className="text-primary hover:underline">
                利用規約
              </Link>
              {" "}第11条をご覧ください。
            </li>
          </ul>
        </section>
      </article>
    </div>
  );
}
