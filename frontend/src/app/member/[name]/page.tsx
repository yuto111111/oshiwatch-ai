type Props = { params: { name: string } };

export default function MemberPage({ params }: Props) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-accent mb-6">{params.name}</h1>

      {/* サマリー履歴 */}
      <section className="card p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-2">サマリー履歴</h2>
        <p className="text-gray-400">（読み込み中...）</p>
      </section>

      {/* 予定一覧 */}
      <section className="card p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-2">予定・イベント</h2>
        <p className="text-gray-400">（読み込み中...）</p>
      </section>

      {/* AI チャット */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-gray-700 mb-2">AI に質問する</h2>
        <p className="text-gray-400">（チャット UI を実装予定）</p>
      </section>
    </main>
  );
}