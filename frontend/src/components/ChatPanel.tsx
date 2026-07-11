"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type Source = { title: string; url: string };
type Message = { role: "user" | "assistant"; content: string; sources?: Source[] };

type Props = {
  /** メンバー詳細ページから使う場合の対象メンバー name_en (単一メンバー チャット) */
  memberName?: string;
  memberDisplayName?: string;
  /** ダッシュボードから使う場合のユーザー ID (フォロー中の推し横断チャット) */
  userId?: string;
  /** チャット欄の空状態プレースホルダに表示する名前 (どちらのケースでも表示用) */
  displayName?: string;
};

export default function ChatPanel({
  memberName,
  memberDisplayName,
  userId,
  displayName,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const placeholderName = memberDisplayName ?? displayName ?? "推し";

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isStreaming) return;

    const history = [...messages, { role: "user" as const, content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    try {
      const body: Record<string, unknown> = {
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      };
      if (memberName) body.member_name = memberName;
      if (userId) body.user_id = userId;

      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.body) throw new Error("no response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const event = JSON.parse(line.slice(6));

          if (event.type === "delta") {
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                ...next[next.length - 1],
                content: next[next.length - 1].content + event.text,
              };
              return next;
            });
          } else if (event.type === "sources") {
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = { ...next[next.length - 1], sources: event.sources };
              return next;
            });
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          ...next[next.length - 1],
          content: "エラーが発生しました。もう一度お試しください。",
        };
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 && (
        <p className="text-gray-400 text-sm">
          {placeholderName}について気になることを質問してみてください。
        </p>
      )}

      {messages.length > 0 && (
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-lg px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-primary text-white self-end max-w-[80%]"
                  : "bg-surface text-gray-700 self-start max-w-[90%]"
              }`}
            >
              {m.role === "assistant" && (
                <div className="flex items-center gap-1 text-xs text-primary mb-1 font-medium">
                  <Sparkles className="w-3 h-3" />
                  推し活AI
                </div>
              )}
              <p className="whitespace-pre-wrap">
                {m.content || (isStreaming && i === messages.length - 1 ? "…" : "")}
              </p>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 space-y-1">
                  {m.sources.map((s) => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-primary hover:underline truncate"
                    >
                      {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="質問を入力..."
          disabled={isStreaming}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="btn-primary px-3 disabled:opacity-50"
          aria-label="送信"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
