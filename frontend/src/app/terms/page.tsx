import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約 | Oshi-Katsu-AI",
  description:
    "Oshi-Katsu-AI の利用規約。本サービスを利用するすべてのユーザーに適用されます。",
};

const SECTIONS: { id: string; title: string }[] = [
  { id: "scope", title: "第1条（適用）" },
  { id: "definition", title: "第2条（定義）" },
  { id: "registration", title: "第3条（利用登録）" },
  { id: "account", title: "第4条（アカウント管理）" },
  { id: "content", title: "第5条（投稿コンテンツ）" },
  { id: "prohibited", title: "第6条（禁止事項）" },
  { id: "ai-content", title: "第7条（AI 生成コンテンツの取扱い）" },
  { id: "ads-affiliate", title: "第8条（広告・アフィリエイト）" },
  { id: "ip", title: "第9条（知的財産権）" },
  { id: "service-changes", title: "第10条（サービスの変更・中断・終了）" },
  { id: "disclaimer", title: "第11条（免責事項）" },
  { id: "limitation", title: "第12条（責任の制限）" },
  { id: "indemnity", title: "第13条（補償）" },
  { id: "termination", title: "第14条（利用停止・アカウント削除）" },
  { id: "minor", title: "第15条（未成年者の利用）" },
  { id: "modification", title: "第16条（規約の改定）" },
  { id: "law", title: "第17条（準拠法・管轄裁判所）" },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">利用規約</h1>
        <p className="text-sm text-gray-500">最終更新日: 2026年5月9日</p>
      </header>

      <nav aria-label="目次" className="card p-4 text-sm space-y-1 bg-gray-50">
        <p className="font-bold text-gray-700 mb-2">目次</p>
        <ul className="space-y-1">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link href={`#${s.id}`} className="text-primary hover:underline">
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <article className="prose prose-sm max-w-none text-gray-700 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <p>
            本利用規約（以下「本規約」）は、運営者（以下「当方」）が提供するウェブサービス
            「Oshi-Katsu-AI」（{" "}
            <a
              href="https://oshikatsu-ai.com"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://oshikatsu-ai.com
            </a>
            ）（以下「本サービス」）の利用条件を定めるものです。本サービスを利用するすべてのユーザー（以下「ユーザー」）は、本規約に同意したうえで利用するものとします。
          </p>
        </section>

        <section id="scope" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">第1条（適用）</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              本規約は、本サービスの提供条件およびユーザーと当方との間の権利義務関係を定めることを目的とし、ユーザーと当方の間の本サービスの利用に関わる一切の関係に適用されます。
            </li>
            <li>
              当方が本サービス上に掲載するガイドライン等は、本規約の一部を構成するものとします。
            </li>
            <li>
              本規約と前項の各規定の内容が異なる場合は、本規約が優先して適用されます。
            </li>
          </ol>
        </section>

        <section id="definition" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">第2条（定義）</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>「コンテンツ」</strong>:
              テキスト、画像、URL、コメント、推しリクエスト、その他本サービス上で投稿・送信される一切の情報。
            </li>
            <li>
              <strong>「推し（エンティティ）」</strong>:
              本サービス上で扱う対象人物・グループ・キャラクター等。
            </li>
            <li>
              <strong>「アカウント」</strong>:
              本サービスを利用するためにユーザーが登録する情報。
            </li>
          </ul>
        </section>

        <section id="registration" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">第3条（利用登録）</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              利用登録は、本規約に同意のうえ、当方の定める方法により申請を行うことで完了します。
            </li>
            <li>
              当方は、申請者に以下の事由があると判断した場合、利用登録を承認しないことがあります。
              <ul className="list-disc pl-6 mt-1">
                <li>虚偽の情報を提供した場合</li>
                <li>過去に本規約違反による利用停止を受けたことがある場合</li>
                <li>その他、当方が利用登録を相当でないと判断した場合</li>
              </ul>
            </li>
          </ol>
        </section>

        <section id="account" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            第4条（アカウント管理）
          </h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              ユーザーは自己の責任において、認証情報（パスワード、ソーシャルログイン連携先等）を適切に管理するものとします。
            </li>
            <li>
              ユーザーは、いかなる場合にもアカウントを第三者に譲渡または貸与することはできません。
            </li>
            <li>
              アカウントの不正利用に起因する損害について、当方は一切責任を負いません。
            </li>
          </ol>
        </section>

        <section id="content" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            第5条（投稿コンテンツ）
          </h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              ユーザーが本サービス上に投稿したコンテンツの著作権はユーザーに帰属します。
            </li>
            <li>
              ユーザーは、当方に対し、投稿コンテンツを本サービスの提供・運営・宣伝・改善のために、無償・非独占的・地理的制限なく、複製・公衆送信・編集・翻訳できる権利を許諾するものとします。
            </li>
            <li>
              ユーザーは、投稿コンテンツについて自らが投稿する正当な権限を有することを表明・保証します。
            </li>
            <li>
              当方は、投稿コンテンツが本規約に違反する、またはそのおそれがあると判断した場合、事前の通知なく削除・非表示にすることができます。
            </li>
          </ol>
        </section>

        <section id="prohibited" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">第6条（禁止事項）</h2>
          <p>ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為または犯罪の助長・教唆に関わる行為</li>
            <li>当方、他のユーザー、または第三者の知的財産権、肖像権、プライバシー、名誉、その他の権利または利益を侵害する行為</li>
            <li>他のユーザーになりすます行為</li>
            <li>誹謗中傷、ハラスメント、差別、ヘイトスピーチ、脅迫を含む投稿</li>
            <li>過度な性的、暴力的、グロテスクな表現を含む投稿</li>
            <li>事実に反する情報、虚偽の噂、未確認のリーク情報を、確定情報のように装って拡散する行為</li>
            <li>本サービスの推しに関する未公開の個人情報（住所・電話番号等）を投稿する行為</li>
            <li>転売目的・営利目的のスパム投稿、無断のアフィリエイトリンク貼付</li>
            <li>本サービスのスクレイピング、リバースエンジニアリング、自動化ツールでの大量アクセス</li>
            <li>本サービスの認証・レート制限・セキュリティ機構を回避する行為</li>
            <li>ウイルス等の有害なコードの送信</li>
            <li>その他、当方が不適切と判断する行為</li>
          </ul>
        </section>

        <section id="ai-content" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            第7条（AI 生成コンテンツの取扱い）
          </h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              本サービスは、生成 AI（Vertex AI / Gemini 等）を用いた要約・回答（以下「AI 生成コンテンツ」）を提供します。
            </li>
            <li>
              AI 生成コンテンツは、ハルシネーション（誤情報）や古い情報を含む可能性があります。当方は AI 生成コンテンツの正確性・完全性・最新性を保証しません。
            </li>
            <li>
              ユーザーは、AI 生成コンテンツを利用するにあたり、必要に応じて自ら一次情報を確認するものとします。
            </li>
            <li>
              当方は、AI 生成コンテンツに起因する損害について、一切責任を負いません。
            </li>
          </ol>
        </section>

        <section id="ads-affiliate" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            第8条（広告・アフィリエイト）
          </h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              本サービスは、Google AdSense 等の第三者広告事業者による広告を表示することがあります。
            </li>
            <li>
              本サービスは、Amazon アソシエイト・楽天アフィリエイト等のアフィリエイトプログラムに参加し、商品リンクを掲載することがあります。リンク経由の購入により、当方が紹介料を受け取ることがあります。
            </li>
            <li>
              広告主・販売事業者と購入ユーザー間の取引に関し、当方は一切の責任を負いません。
            </li>
          </ol>
        </section>

        <section id="ip" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            第9条（知的財産権）
          </h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              本サービスのソースコード、デザイン、ロゴ、文章、画像、音声、映像、その他のコンテンツに関する一切の知的財産権は、当方または正当な権利者に帰属します。
            </li>
            <li>
              ユーザーは、当方の事前の書面による許諾なく、本サービスのコンテンツを複製・転載・配布・販売することはできません。
            </li>
          </ol>
        </section>

        <section id="service-changes" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            第10条（サービスの変更・中断・終了）
          </h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              当方は、ユーザーへの事前通知なく、本サービスの内容を変更、追加、削除、または提供を中断・終了することができます。
            </li>
            <li>
              当方は、本条に基づきサービスの変更・中断・終了がなされたことに起因してユーザーに生じた損害について、一切責任を負いません。
            </li>
          </ol>
        </section>

        <section id="disclaimer" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            第11条（免責事項）
          </h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              当方は、本サービスに関し、その完全性、正確性、確実性、有用性、安全性等について、いかなる保証も行いません。
            </li>
            <li>
              当方は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定目的への適合性、セキュリティ等に関する欠陥、エラーやバグ、権利侵害等）がないことを保証しません。
            </li>
            <li>
              本サービスで取り扱う推しに関する情報は、外部ソースから収集された情報、AI による生成情報、ユーザーによる投稿情報等を含み、その正確性は保証されません。
            </li>
          </ol>
        </section>

        <section id="limitation" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            第12条（責任の制限）
          </h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              当方は、本サービスの利用または利用不能から生じる、いかなる直接的、間接的、付随的、特別、結果的、または懲罰的損害（逸失利益、データの損失、業務の中断等を含むがこれに限定されない）について、一切責任を負いません。
            </li>
            <li>
              本サービスは無償で提供されるものであり、消費者契約法等の法令により当方の責任を完全には免責できない場合であっても、当方の損害賠償責任は、ユーザーが直接負担した直接かつ通常の損害に限定されます。
            </li>
          </ol>
        </section>

        <section id="indemnity" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            第13条（補償）
          </h2>
          <p>
            ユーザーが本規約に違反したことに起因して、当方または第三者に損害が生じた場合、ユーザーは当該損害を賠償するものとします。
          </p>
        </section>

        <section id="termination" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            第14条（利用停止・アカウント削除）
          </h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              当方は、ユーザーが本規約に違反した場合、事前の通知なく、当該ユーザーの本サービスの利用を停止し、またはアカウントを削除することができます。
            </li>
            <li>
              ユーザーはいつでも、{" "}
              <Link href="/settings/profile" className="text-primary hover:underline">
                設定ページ
              </Link>
              からアカウントを削除することができます。
            </li>
          </ol>
        </section>

        <section id="minor" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            第15条（未成年者の利用）
          </h2>
          <p>
            未成年のユーザーは、本サービスの利用にあたり、保護者の同意を得るものとします。
          </p>
        </section>

        <section id="modification" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            第16条（規約の改定）
          </h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              当方は、必要と判断した場合、ユーザーへの事前の通知なく、本規約を改定することができます。
            </li>
            <li>
              改定後の本規約は、本サービス内に掲示した時点から効力を生じます。
            </li>
          </ol>
        </section>

        <section id="law" className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            第17条（準拠法・管轄裁判所）
          </h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>本規約の解釈および適用は、日本法に準拠します。</li>
            <li>
              本サービスに関して当方とユーザーの間で紛争が生じた場合は、当方の本拠地を管轄する日本国の裁判所を第一審の専属的合意管轄裁判所とします。
            </li>
          </ol>
        </section>
      </article>

      <footer className="border-t border-gray-200 pt-6 text-xs text-gray-400">
        <p>制定: 2026年5月9日</p>
        <p className="mt-2">
          関連: {" "}
          <Link href="/privacy" className="text-primary hover:underline">
            プライバシーポリシー
          </Link>
          {" / "}
          <Link href="/legal/operator" className="text-primary hover:underline">
            運営者情報
          </Link>
        </p>
      </footer>
    </div>
  );
}
