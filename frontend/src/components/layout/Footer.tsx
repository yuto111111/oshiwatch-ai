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
        </div>
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          &copy; 2026 Oshi-Katsu-AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
