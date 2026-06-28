import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OshiWatch AI",
  description: "Snow Man の最新情報を AI が自動収集・要約",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}