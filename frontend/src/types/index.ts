/**
 * ハッカソン用ミニマル型定義。 本家アプリの複雑なドメインモデルは削除し、
 * oshiwatch-ai バックエンド (FastAPI) の DTO に沿った形に絞る。
 */

export type Entity = {
  id: string;
  slug?: string | null;
  canonical_name: string;
  names_jsonb: Record<string, string>;
  genre: string;
  country: string;
  official_links: { label: string; url: string }[];
  icon: string;
  follower_count: number;
  member_color?: string;
  entity_type?: "group" | "member" | "individual";
  parent_entity_id?: string | null;
  parent?: ParentEntityRef | null;
};

export type ParentEntityRef = {
  id: string;
  slug?: string | null;
  canonical_name: string;
};

export type MemberSummary = {
  id: string;
  slug?: string | null;
  canonical_name: string;
  icon?: string | null;
  follower_count: number;
};

export type DailySummary = {
  entity_id: string;
  date: string;
  summary: string;
  bullets: string[];
  sources: { title: string; url: string }[];
  confidence_level?: string;
  updated_at?: string | null;
};

export type GlobalTopic = {
  entity_id: string;
  slug?: string | null;
  canonical_name: string;
  icon?: string | null;
  summary: string;
  bullets: string[];
  score: number;
};

export type GlobalTopics = {
  date: string;
  topics: GlobalTopic[];
};

export type ChatSource = {
  title: string;
  url: string;
};

export type ChatSSEEvent =
  | { type: "delta"; text: string }
  | { type: "sources"; sources: ChatSource[] }
  | { type: "done" };
