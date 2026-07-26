"use client";

// ハッカソン用 AIChatPanel: oshiwatch-ai バックエンド `/api/chat` に SSE で接続。
// 本家のパネル UI を踏襲しつつ、認証なし・entityId ベースで動作する軽量版。

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { safeUrl } from "@/lib/utils/safe-url";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type Source = { title: string; url: string | null };
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

const PRESETS = [
  "今日の注目ポイントは？",
  "最近の主演作品を教えて",
  "次のライブ・イベントの予定は？",
  "誕生日はいつ？",
];

export default function AIChatPanel({
  entityId,
  entityName,
}: {
  entityId: string;
  entityName: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const send = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || loading) return;
      setError(null);

      const history: ChatMessage[] = [
        ...messages,
        { role: "user", content: q },
      ];
      setMessages([...history, { role: "assistant", content: "" }]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch(`${API_BASE_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            member_name: entityId,
            messages: history.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.body) throw new Error("no response body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";

          for (const chunk of chunks) {
            if (!chunk.startsWith("data: ")) continue;
            const evt = JSON.parse(chunk.slice(6));
            if (evt.type === "delta") {
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                  ...next[next.length - 1],
                  content: next[next.length - 1].content + evt.text,
                };
                return next;
              });
            } else if (evt.type === "sources") {
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                  ...next[next.length - 1],
                  sources: evt.sources,
                };
                return next;
              });
            }
          }
        }
      } catch (e) {
        setError("エラーが発生しました。 もう一度お試しください。");
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, entityId],
  );

  return (
    <div className="flex flex-col gap-3">
      {messages.length === 0 && (
        <>
          <p className="text-xs text-gray-500">
            {entityName} について気になることを質問してみてください。
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                disabled={loading}
                className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </>
      )}

      {messages.length > 0 && (
        <div
          ref={listRef}
          className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-2xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-primary text-white self-end max-w-[80%]"
                  : "bg-gray-50 text-gray-800 self-start max-w-[92%] border border-gray-100"
              }`}
            >
              {m.role === "assistant" && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                  推し活AI
                </p>
              )}
              <div className="prose prose-sm max-w-none whitespace-pre-wrap break-words">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content ||
                    (loading && i === messages.length - 1 ? "…" : "")}
                </ReactMarkdown>
              </div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 space-y-1 border-t border-gray-200 pt-2">
                  {m.sources.map((s, si) =>
                    s.url ? (
                      <a
                        key={si}
                        href={safeUrl(s.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-[11px] text-primary hover:underline truncate"
                      >
                        {s.title || s.url}
                      </a>
                    ) : (
                      // grounding 参照元 (ドメイン名のみ)。GCP のリダイレクト
                      // URL は露出させない方針のためリンクにしない
                      <span
                        key={si}
                        className="block text-[11px] text-gray-400 truncate"
                      >
                        {s.title}
                      </span>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-rose-500">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="質問を入力..."
          disabled={loading}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary px-4 disabled:opacity-50"
        >
          送信
        </button>
      </form>
    </div>
  );
}
