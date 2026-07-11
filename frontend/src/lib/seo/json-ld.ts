// Schema.org JSON-LD 生成ユーティリティ。
//
// 推し別ページ (`/entities/[id]`) の <head> に埋める構造化データを組み立てる。
// Google のリッチリザルト (MusicGroup / Person / MusicEvent) を狙う。
//
// 設計メモ:
// - entity_type ごとに最適な @type を割り当てる (group → MusicGroup, individual/member → Person)
// - null / undefined / 空配列のフィールドは出力しない (検証ツールでの警告回避)
// - URL は slug があれば slug、無ければ id を使う (canonical を generateMetadata と揃える)
// - 出力サイズ抑制のため members は最大 20 件まで
// - sameAs には official_links の url 配列を渡す (Wikipedia, 公式サイト, X, Instagram など)

import type { Entity, MemberSummary } from "@/types";

// ハッカソン用に EventSchedule を型ローカル化 (本家の詳細型は不要)
type EventSchedule = {
  id: string;
  title: string;
  start_at: string;
  type: string;
  source_url?: string;
};

const SITE_BASE = "https://oshikatsu-ai.com";
const MAX_MEMBERS = 20;

type JsonLdObject = Record<string, unknown>;

/**
 * undefined/null/空配列を除いた object を返す。
 * Schema.org の検証ツールで「value of property X is empty」を防ぐためのヘルパ。
 */
function compact<T extends JsonLdObject>(obj: T): JsonLdObject {
  const result: JsonLdObject = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === "string" && value.length === 0) continue;
    result[key] = value;
  }
  return result;
}

function entityUrl(entity: Pick<Entity, "id" | "slug">): string {
  const path = entity.slug || entity.id;
  return `${SITE_BASE}/entities/${path}`;
}

function entityImage(entity: Pick<Entity, "icon">): string | undefined {
  if (entity.icon && entity.icon.startsWith("http")) return entity.icon;
  return undefined;
}

/**
 * names_jsonb から canonical_name と重複しない alternateName 配列を抽出。
 * 例: { ja: "スノーマン", en: "Snow Man", romaji: "Snow Man" } → ["スノーマン", "Snow Man"]
 */
function alternateNames(entity: Pick<Entity, "canonical_name" | "names_jsonb">): string[] {
  if (!entity.names_jsonb) return [];
  const seen = new Set<string>([entity.canonical_name]);
  const result: string[] = [];
  for (const value of Object.values(entity.names_jsonb)) {
    if (typeof value !== "string" || value.length === 0) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

function sameAs(entity: Pick<Entity, "official_links">): string[] {
  if (!entity.official_links) return [];
  return entity.official_links
    .map((link) => link?.url)
    .filter((url): url is string => typeof url === "string" && url.length > 0);
}

function buildMusicGroup(
  entity: Entity,
  members?: MemberSummary[],
): JsonLdObject {
  const memberNodes = (members ?? []).slice(0, MAX_MEMBERS).map((m) =>
    compact({
      "@type": "Person",
      name: m.canonical_name,
      url: entityUrl({ id: m.id, slug: m.slug ?? undefined }),
      image: m.icon && m.icon.startsWith("http") ? m.icon : undefined,
    }),
  );

  return compact({
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: entity.canonical_name,
    alternateName: alternateNames(entity),
    url: entityUrl(entity),
    image: entityImage(entity),
    genre: entity.genre || undefined,
    member: memberNodes,
    sameAs: sameAs(entity),
  });
}

function buildPerson(entity: Entity): JsonLdObject {
  // parent (グループ) が紐づいていれば memberOf を出す。
  const memberOf = entity.parent
    ? compact({
        "@type": "MusicGroup",
        name: entity.parent.canonical_name,
        url: entityUrl({ id: entity.parent.id, slug: entity.parent.slug ?? undefined }),
      })
    : undefined;

  return compact({
    "@context": "https://schema.org",
    "@type": "Person",
    name: entity.canonical_name,
    alternateName: alternateNames(entity),
    url: entityUrl(entity),
    image: entityImage(entity),
    memberOf,
    sameAs: sameAs(entity),
  });
}

/**
 * entity_type に応じた Schema.org node を組み立てる。
 *
 * @param events 公演リスト (任意)。渡されれば performer に entity を持つ MusicEvent / Event を追加。
 * @param members グループの場合のメンバー (最大 20 件まで member プロパティに展開)。
 * @returns 単一ノード、または events を含む場合は graph 用配列。
 */
export function buildEntityJsonLd(
  entity: Entity,
  events?: EventSchedule[],
  members?: MemberSummary[],
): JsonLdObject | JsonLdObject[] {
  const entityType = entity.entity_type ?? "individual";
  const entityNode =
    entityType === "group" ? buildMusicGroup(entity, members) : buildPerson(entity);

  if (!events || events.length === 0) {
    return entityNode;
  }

  const eventNodes = events.map((ev) => buildEventJsonLd(ev, entity));
  return [entityNode, ...eventNodes];
}

// =============================================================================
// サイト全体レベルの JSON-LD (トップ / /about / /search で使い回す)
//   - WebSite: サイトリンク検索ボックス (potentialAction=SearchAction) を狙う
//   - Organization: 「推し活AI」の運営元表示、alternateName で表記ゆれ対策
//   - WebApplication: アプリ性 (Free, Browser, インストール不要) を明示
// =============================================================================

const SITE_NAME_JA = "推し活AI";
const SITE_ALT_NAMES = [
  "推し活 AI",   // 半角スペースあり
  "推しカツAI", // カタカナ表記ゆれ
  "推しかつAI", // ひらがな表記ゆれ
  "Oshi-Katsu-AI",
  "OshikatsuAI",
];
const SITE_DESCRIPTION_JA =
  "アイドル・K-POPなどの推しの動向、あなたの推し活の活動記録、チケットや予定の管理を推し活AI一つで。";

/** サイト全体の WebSite JSON-LD (トップページに埋め込む) */
export function buildWebSiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_BASE}/#website`,
    name: SITE_NAME_JA,
    alternateName: SITE_ALT_NAMES,
    url: SITE_BASE,
    inLanguage: "ja-JP",
    description: SITE_DESCRIPTION_JA,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_BASE}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: { "@id": `${SITE_BASE}/#organization` },
  };
}

/** 運営元の Organization JSON-LD (Google Knowledge Panel を狙う) */
export function buildOrganizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_BASE}/#organization`,
    name: SITE_NAME_JA,
    alternateName: SITE_ALT_NAMES,
    url: SITE_BASE,
    logo: `${SITE_BASE}/images/logo.png`,
    description: SITE_DESCRIPTION_JA,
  };
}

/** WebApplication JSON-LD (「アプリ」としての性質を明示) */
export function buildWebApplicationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME_JA,
    alternateName: SITE_ALT_NAMES,
    url: SITE_BASE,
    description: SITE_DESCRIPTION_JA,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    inLanguage: "ja-JP",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
  };
}

/** FAQ JSON-LD (/about で Google 検索の FAQ リッチリザルトを狙う) */
export function buildFaqJsonLd(
  items: Array<{ question: string; answer: string }>,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * イベント (公演 / 発売 / 配信 など) を MusicEvent / Event として組み立てる。
 *
 * EventSchedule には venue フィールドが無いため、location は省略する
 * (構造化データとしては場所未定でも valid)。
 * TODO: 公演会場フィールド追加後に location を埋める。
 */
export function buildEventJsonLd(event: EventSchedule, entity: Entity): JsonLdObject {
  const isMusic = entity.entity_type === "group" || entity.entity_type === "member";
  const performerType = entity.entity_type === "group" ? "MusicGroup" : "Person";

  return compact({
    "@context": "https://schema.org",
    "@type": isMusic ? "MusicEvent" : "Event",
    name: event.title,
    startDate: event.start_at,
    url: event.source_url || entityUrl(entity),
    performer: compact({
      "@type": performerType,
      name: entity.canonical_name,
      url: entityUrl(entity),
    }),
  });
}
