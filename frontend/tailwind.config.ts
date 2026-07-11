import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // E3-A: Powder Pastel × 統一ボタン。明るい sky 基調。
        // primary は全 CTA（ログイン・推しを探す・カード内ボタン）に使用。
        // secondary は border 等の薄いアクセントに、accent はヒーロー上の濃紺テキストに、
        // surface はページ背景に使用。
        primary: "#0EA5E9", // sky-500
        secondary: "#BAE6FD", // sky-200（薄い水色: border / 装飾）
        accent: "#0C4A6E", // sky-900（明るい背景上の濃紺テキスト）
        surface: "#F0F9FF", // sky-50（ページ背景）
        // 過去互換: ink は accent と同じ濃紺にエイリアス
        ink: "#0C4A6E",
      },
    },
  },
  plugins: [],
};

export default config;
