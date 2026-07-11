// SSR で <script type="application/ld+json"> を吐くサーバーコンポーネント。
//
// next/script (afterInteractive) はクライアント側で挿入されるため、
// Googlebot のクロール時に JSON-LD が読まれない場合がある。
// 確実に初回 HTML に含めるため、生の <script dangerouslySetInnerHTML> で出力する。
//
// 配列が渡された場合は @graph 形式に包んで 1 つの script タグにまとめる
// (推奨パターン、Schema.org Validator も @graph を解釈する)。

type Props = {
  data: object | object[];
};

function serialize(data: object | object[]): string {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : data;
  // </script> インジェクション対策で `<` を Unicode エスケープする。
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

export default function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}
