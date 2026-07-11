import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー | Oshi-Katsu-AI",
  description:
    "Oshi-Katsu-AI のプライバシーポリシー。取得する情報、利用目的、第三者提供、Cookie・広告・アフィリエイトの取り扱いを記載しています。",
};

const SECTIONS: { id: string; title: string }[] = [
  { id: "intro", title: "1. はじめに" },
  { id: "operator", title: "2. 運営者情報" },
  { id: "collected-info", title: "3. 取得する情報" },
  { id: "purpose", title: "4. 利用目的" },
  { id: "third-party", title: "5. 第三者への提供・委託" },
  { id: "third-party-services", title: "6. 利用する第三者サービス" },
  { id: "cookies", title: "7. Cookie・トラッキング技術" },
  { id: "advertising", title: "8. 広告配信について（Google AdSense）" },
  { id: "affiliate", title: "9. アフィリエイト・プロモーション表示について" },
  { id: "ai-rag", title: "10. AI（生成AI / RAG）の利用について" },
  { id: "security", title: "11. 情報の保管・セキュリティ" },
  { id: "user-rights", title: "12. ユーザーの権利（開示・訂正・削除請求）" },
  { id: "minors", title: "13. 未成年者の利用について" },
  { id: "changes", title: "14. プライバシーポリシーの改定" },
  { id: "contact", title: "15. お問い合わせ" },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">
          プライバシーポリシー
        </h1>
        <p className="text-sm text-gray-500">最終更新日: 2026年5月9日</p>
      </header>

      <nav
        aria-label="目次"
        className="card p-4 text-sm space-y-1 bg-gray-50"
      >
        <p className="font-bold text-gray-700 mb-2">目次</p>
        <ul className="space-y-1">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link
                href={`#${s.id}`}
                className="text-primary hover:underline"
              >
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <article className="prose prose-sm max-w-none text-gray-700 space-y-6 leading-relaxed">
        <section id="intro" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">1. はじめに</h2>
          <p>
            本プライバシーポリシー（以下「本ポリシー」）は、運営者（以下「当方」）が提供するウェブサービス
            「Oshi-Katsu-AI」（{" "}
            <a
              href="https://oshikatsu-ai.com"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://oshikatsu-ai.com
            </a>
            ）（以下「本サービス」）におけるユーザーの個人情報および利用情報の取り扱いについて定めるものです。
          </p>
          <p>
            本サービスを利用された場合、本ポリシーの内容に同意いただいたものとみなします。
          </p>
        </section>

        <section id="operator" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">2. 運営者情報</h2>
          <p>
            本サービスの運営者情報は、別途{" "}
            <Link href="/legal/operator" className="text-primary hover:underline">
              運営者情報ページ
            </Link>
            に記載しています。
          </p>
        </section>

        <section id="collected-info" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            3. 取得する情報
          </h2>
          <p>当方は、本サービスの提供にあたり以下の情報を取得することがあります。</p>
          <h3 className="font-bold text-gray-700 mt-3">
            (1) ユーザーが直接提供する情報
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>メールアドレス、ユーザーID、表示名（ニックネーム）</li>
            <li>言語・タイムゾーン・国/地域などのプロフィール情報</li>
            <li>フォロー中の推し（エンティティ）情報</li>
            <li>コミュニティ投稿、コメント、通報内容、推しリクエスト内容</li>
            <li>プロフィール画像、推しごとのカスタムカラーなど任意設定項目</li>
          </ul>
          <h3 className="font-bold text-gray-700 mt-3">
            (2) 自動的に取得する情報
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>IPアドレス、ユーザーエージェント、リファラ</li>
            <li>ページビュー、クリックイベント、滞在時間などの利用ログ</li>
            <li>広告の表示・クリックに関するイベントデータ</li>
            <li>Cookie および類似技術によるセッション識別子</li>
          </ul>
          <h3 className="font-bold text-gray-700 mt-3">
            (3) 第三者認証から取得する情報
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Google / Facebook / X（Twitter）などのソーシャルログインを利用された場合、各プロバイダーから取得するメールアドレス、表示名、プロフィール画像URL、プロバイダー固有ID。
            </li>
          </ul>
        </section>

        <section id="purpose" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">4. 利用目的</h2>
          <p>取得した情報は以下の目的で利用します。</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>本サービスの提供・本人確認・認証</li>
            <li>推しに関する情報の表示・パーソナライズ</li>
            <li>コミュニティ機能の提供および治安維持（通報対応・スパム防止）</li>
            <li>サービスの利用状況分析・機能改善</li>
            <li>広告配信およびその効果測定</li>
            <li>不正利用防止、セキュリティ確保</li>
            <li>法令に基づく対応</li>
            <li>お問い合わせへの対応</li>
          </ul>
        </section>

        <section id="third-party" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            5. 第三者への提供・委託
          </h2>
          <p>
            当方は、ユーザー本人の同意がある場合、または法令に基づく場合を除き、ユーザーの個人情報を第三者に提供することはありません。
          </p>
          <p>
            ただし、サービス運営に必要な範囲で、後述の第三者サービスに対し、利用に必要な情報を委託または送信する場合があります。
          </p>
        </section>

        <section id="third-party-services" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            6. 利用する第三者サービス
          </h2>
          <p>本サービスは以下の第三者サービスを利用しています。</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Google Cloud Platform</strong>（インフラ・配信・解析）
            </li>
            <li>
              <strong>Supabase</strong>（認証およびデータベース）
            </li>
            <li>
              <strong>Vertex AI（Google Cloud）</strong>
              （生成AIによる要約・Q&Aの生成、ベクトル検索）
            </li>
            <li>
              <strong>Upstash Redis</strong>（レート制限・キャッシュ）
            </li>
            <li>
              <strong>Sentry</strong>（エラー監視）
            </li>
            <li>
              <strong>Plausible Analytics</strong>（プライバシーフレンドリーな利用解析）
            </li>
            <li>
              <strong>Google AdSense</strong>（広告配信）
            </li>
            <li>
              <strong>Amazon アソシエイト・楽天アフィリエイト</strong>
              （アフィリエイトリンク経由の商品情報表示）
            </li>
          </ul>
          <p>
            各サービスのプライバシー方針は、それぞれの提供事業者の公式ページをご確認ください。
          </p>
        </section>

        <section id="cookies" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            7. Cookie・トラッキング技術
          </h2>
          <p>
            本サービスは、ユーザー体験の向上、ログイン状態の維持、利用状況分析、広告配信のために Cookie および類似技術（ローカルストレージ等）を利用します。
          </p>
          <p>
            ブラウザの設定により Cookie の受け入れを拒否することができますが、その場合、ログインや一部機能が正常に動作しない場合があります。
          </p>
        </section>

        <section id="advertising" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            8. 広告配信について（Google AdSense）
          </h2>
          <p>
            本サービスは、第三者配信の広告サービス「Google AdSense」を利用することがあります。広告配信事業者は、ユーザーの興味に応じた広告を表示するために、当サイトや他サイトへのアクセスに関する情報（氏名、住所、メールアドレス、電話番号は含まれません）を Cookie 等を用いて使用することがあります。
          </p>
          <p>
            このプロセスの詳細や Cookie を無効にする方法については、{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google 広告に関するポリシー
            </a>
            {" "}をご覧ください。
          </p>
          <p>
            また、第三者配信事業者または広告ネットワークが配信する広告を本サービスに表示する場合があります。各広告事業者の Cookie 利用に関するオプトアウトは{" "}
            <a
              href="https://www.aboutads.info/choices/"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              YourAdChoices
            </a>
            {" "}から行えます。
          </p>
        </section>

        <section id="affiliate" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            9. アフィリエイト・プロモーション表示について
          </h2>
          <p>
            本サービスには、Amazon.co.jp / 楽天市場などのアフィリエイトプログラムに基づく商品リンクを掲載することがあります。これらのリンクを経由して商品を購入された場合、当方に紹介料が支払われることがあります。
          </p>
          <p>
            <strong>
              「Oshi-Katsu-AI は、Amazon.co.jp を宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazon アソシエイト・プログラムの参加者です。」
            </strong>
          </p>
          <p>
            また、本サービスは景品表示法に基づき、広告・プロモーションを含む表示にはその旨が判別できるよう努めています（例: 「PR」「広告」表記）。
          </p>
        </section>

        <section id="ai-rag" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            10. AI（生成AI / RAG）の利用について
          </h2>
          <p>
            本サービスでは、推しに関する情報の要約や Q&A 機能を提供するために、Google Vertex AI（Gemini / Embeddings 等）を利用しています。
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              ユーザーが入力した質問テキストは、回答生成のため Vertex AI に送信されます。
            </li>
            <li>
              生成された回答にはハルシネーション（誤情報）が含まれる可能性があります。重要な意思決定や金銭的取引は、必ず公式情報源で確認してください。
            </li>
            <li>
              当方は、AI 回答の正確性を保証するものではありません。
            </li>
          </ul>
        </section>

        <section id="security" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            11. 情報の保管・セキュリティ
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              当方は、取得した情報の漏えい・紛失・改ざんを防止するために合理的な安全管理措置を講じます。
            </li>
            <li>
              通信は HTTPS により暗号化されています。
            </li>
            <li>
              認証情報・APIキー等の機密情報は、Google Secret Manager 等のシークレット管理サービスで保管しています。
            </li>
            <li>
              データベースには行レベルセキュリティ（RLS）を適用し、ユーザー間の情報分離を実装しています。
            </li>
          </ul>
        </section>

        <section id="user-rights" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            12. ユーザーの権利（開示・訂正・削除請求）
          </h2>
          <p>
            ユーザーは、当方が保有する自己の個人情報について、開示・訂正・削除・利用停止を請求することができます。
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              プロフィール情報の閲覧・編集は{" "}
              <Link href="/settings/profile" className="text-primary hover:underline">
                設定ページ
              </Link>
              から行えます。
            </li>
            <li>
              アカウントおよび関連データの削除は、設定ページ内「アカウントを削除する」から実行できます。
            </li>
            <li>
              その他の請求は、第15条のお問い合わせ先よりご連絡ください。
            </li>
          </ul>
        </section>

        <section id="minors" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            13. 未成年者の利用について
          </h2>
          <p>
            未成年者が本サービスを利用される場合は、保護者の同意のもと利用してください。
          </p>
        </section>

        <section id="changes" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            14. プライバシーポリシーの改定
          </h2>
          <p>
            本ポリシーは、法令の改正やサービスの変更に応じて改定することがあります。重要な変更がある場合は、本サービス内で告知します。
          </p>
        </section>

        <section id="contact" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            15. お問い合わせ
          </h2>
          <p>
            本ポリシーに関するお問い合わせは、{" "}
            <Link href="/legal/operator" className="text-primary hover:underline">
              運営者情報ページ
            </Link>
            記載の連絡先までお願いします。
          </p>
        </section>
      </article>

      <footer className="border-t border-gray-200 pt-6 text-xs text-gray-400">
        <p>制定: 2026年5月9日</p>
      </footer>
    </div>
  );
}
