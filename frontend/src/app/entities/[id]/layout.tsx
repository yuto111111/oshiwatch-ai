import type { Metadata } from "next";
import { fetchEntity } from "@/lib/api/entities";

const SITE_NAME = "推し活AI";
const SITE_BASE = "https://devtest.oshikatsu-ai.com";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  let title = `推しの詳細 | ${SITE_NAME}`;
  let description = "推しの今日のまとめと AI チャット";

  try {
    const entity = await fetchEntity(params.id);
    title = `${entity.canonical_name} | ${SITE_NAME}`;
    description = `${entity.canonical_name} の今日のまとめと AI チャット。`;
  } catch {
    // 404
  }

  const canonicalPath = `/entities/${params.id}`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_BASE}${canonicalPath}` },
    openGraph: {
      title,
      description,
      url: `${SITE_BASE}${canonicalPath}`,
      siteName: SITE_NAME,
      locale: "ja_JP",
      type: "profile",
    },
  };
}

export default function EntityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
