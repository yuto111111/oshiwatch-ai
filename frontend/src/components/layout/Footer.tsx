import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Oshi-Katsu-AI
            </span>
            <p className="text-sm text-gray-500 mt-1">
              AIで推し活をもっと楽しく
            </p>
          </div>
          <div className="flex gap-8 text-sm text-gray-500 flex-wrap">
            <div className="flex flex-col gap-2">
              <Link href="/" className="hover:text-primary">HOME</Link>
              <Link href="/about" className="hover:text-primary">推し活AI とは</Link>
              <Link href="/search" className="hover:text-primary">SEARCH</Link>
              <Link href="/community" className="hover:text-primary">COMMUNITY</Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className="hover:text-primary">MY DASHBOARD</Link>
              <Link href="/settings/profile" className="hover:text-primary">設定</Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/privacy" className="hover:text-primary">プライバシーポリシー</Link>
              <Link href="/terms" className="hover:text-primary">利用規約</Link>
              <Link href="/legal/operator" className="hover:text-primary">運営者情報</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          &copy; 2026 Oshi-Katsu-AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
