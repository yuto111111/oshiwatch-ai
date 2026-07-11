import type { Metadata } from "next";
import Link from "next/link";
import { Music2 } from "lucide-react";

import "./globals.css";

export const metadata: Metadata = {
  title: "推し活AI",
  description:
    "アイドル・K-POP など推しの動向、あなたの推し活の活動記録、チケットや予定の管理を推し活AI一つで。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-gray-800">
              <span className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center">
                <Music2 className="w-4 h-4" />
              </span>
              推し活AI
            </Link>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="mt-8 bg-white border-t-2 border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-6 flex items-center gap-2 text-sm text-gray-400">
            <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center">
              <Music2 className="w-3 h-3" />
            </span>
            <span>推し活AI · 推しの動向を AI がまとめる</span>
            <span className="ml-auto">&copy; 2026 推し活AI</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
