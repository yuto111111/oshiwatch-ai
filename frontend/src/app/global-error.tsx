"use client";

import { useEffect } from "react";

/**
 * Next.js 14 のグローバルエラー境界。
 * Server Component / Client Component のいずれかで unhandled exception が起きた時に
 * Next.js デフォルトの「Application error: a client-side exception has occurred」の代わりに
 * このコンポーネントが表示される。
 *
 * Sentry / Cloud Logging を仕込んでいるなら effect 内でレポート送信する。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="ja">
      <body
        style={{
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", "Hiragino Sans", sans-serif',
          minHeight: "100vh",
          background: "#F5F5F4",
          color: "#0F0F14",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          gap: "16px",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          画面の表示中にエラーが発生しました
        </h1>
        <p style={{ fontSize: 14, color: "#52525B", maxWidth: 480, textAlign: "center", margin: 0 }}>
          時間をおいて再度お試しください。問題が続く場合は下記の詳細を運営にお知らせください。
        </p>

        <details
          style={{
            maxWidth: 720,
            width: "100%",
            background: "white",
            padding: "16px",
            borderRadius: 8,
            border: "1px solid #E4E4E7",
            fontSize: 12,
            color: "#27272A",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>
            エラー詳細
          </summary>
          <div style={{ marginTop: 12 }}>
            <p>
              <strong>name:</strong> {error.name}
            </p>
            <p>
              <strong>message:</strong> {error.message}
            </p>
            {error.digest && (
              <p>
                <strong>digest:</strong> {error.digest}
              </p>
            )}
            {error.stack && (
              <pre style={{ marginTop: 8, fontSize: 11, lineHeight: 1.4 }}>
                {error.stack}
              </pre>
            )}
          </div>
        </details>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#0A0A0F",
              color: "white",
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              fontWeight: 500,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            もう一度試す
          </button>
          <a
            href="/"
            style={{
              background: "white",
              color: "#0A0A0F",
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid #D4D4D8",
              fontWeight: 500,
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            ホームへ戻る
          </a>
        </div>
      </body>
    </html>
  );
}
