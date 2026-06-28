export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-accent mb-6">Snow Man 今日のまとめ</h1>

      {/* グループ全体サマリー */}
      <section className="card p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-2">グループ全体</h2>
        <p className="text-gray-500">（サマリーを読み込み中...）</p>
      </section>

      {/* メンバーカード一覧 */}
      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-4">メンバー別</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* TODO: メンバーカードをここに表示 */}
          <p className="text-gray-400 col-span-full">（メンバー情報を読み込み中...）</p>
        </div>
      </section>
    </main>
  );
}