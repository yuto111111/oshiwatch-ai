import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { OSHI_GROUPS, OSHI_LIST } from "@/lib/data/oshi-list";

export const metadata = {
  title: "推しを探す",
  description: "対応中の推し (アイドル / K-POP) を一覧から探す。",
};

const BRAND_SKY = "#0EA5E9";

export default function SearchPage() {
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
            <SearchIcon size={11} className="inline mr-1" /> 推しを探す
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900">
            対応中の推し
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-xl">
            グループを選んでメンバー一覧を表示。 各メンバーの推し詳細ページから
            今日のまとめ + AI チャットが使えます。
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 space-y-10">
        {OSHI_GROUPS.map((group) => {
          const members = OSHI_LIST.filter((m) => m.group === group.name);
          return (
            <section key={group.id} className="space-y-4">
              <div className="flex items-baseline gap-3">
                <h2
                  className="text-lg font-bold"
                  style={{ color: group.color }}
                >
                  {group.name}
                </h2>
                {group.description && (
                  <span className="text-xs text-gray-500">
                    {group.description}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {members.map((m) => (
                  <Link
                    key={m.name_en}
                    href={`/entities/${m.name_en}`}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:-translate-y-0.5 hover:shadow-md transition-all"
                    style={{ borderColor: `${m.color}33` }}
                  >
                    <span
                      className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-sm"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.name.slice(0, 1)}
                    </span>
                    <p className="text-sm font-bold text-gray-900 text-center">
                      {m.name}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
