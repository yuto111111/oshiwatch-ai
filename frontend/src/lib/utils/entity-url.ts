// 推し詳細ページへの URL を組み立てるヘルパ。
// slug があれば人間可読 URL (/entities/otani-shohei)、無ければ UUID 互換 URL。

export function entityHref(
  entity:
    | { slug?: string | null; id?: string | null }
    | { slug?: string | null; entity_id?: string | null }
): string {
  const slug = (entity as { slug?: string | null }).slug;
  if (slug) return `/entities/${slug}`;
  const id =
    (entity as { id?: string | null }).id ??
    (entity as { entity_id?: string | null }).entity_id;
  return `/entities/${id ?? ""}`;
}
