/**
 * ハッカソン用エンティティ API 層。
 * oshiwatch-ai バックエンド (`/api/summaries/*`) のレスポンスを
 * 本家 UI コンポーネントが期待する Entity / DailySummary 形式に変換する。
 */

import { apiFetch } from "./client";
import { SNOW_MAN_GROUP, SNOW_MAN_MEMBERS, findMember } from "@/lib/data/snow-man";
import type {
  Entity,
  DailySummary,
  GlobalTopic,
  GlobalTopics,
  MemberSummary,
} from "@/types";

type RemoteMemberCard = {
  id: string;
  name: string;
  name_en: string;
  image_url: string | null;
  color: string | null;
  summary?: string | null;
  next_event?: {
    id: string;
    title: string;
    event_date: string;
    description: string | null;
    source_url: string | null;
  } | null;
};

type RemoteMemberSummaries = { members: RemoteMemberCard[] };

type RemoteMemberDetail = {
  member: RemoteMemberCard;
  summaries: {
    summary: string;
    date: string;
    created_at: string | null;
    bullets: string[];
    sources: { title: string; url: string }[];
  }[];
  events: {
    id: string;
    title: string;
    event_date: string;
    description: string | null;
    source_url: string | null;
  }[];
};

type RemoteGroupSummary = {
  summary: string;
  date: string | null;
  bullets: string[];
  sources: { title: string; url: string }[];
};

function memberToEntity(m: RemoteMemberCard): Entity {
  return {
    id: m.name_en,
    slug: m.name_en,
    canonical_name: m.name,
    names_jsonb: { ja: m.name, en: m.name_en },
    genre: "アイドル",
    country: "JP",
    official_links: [],
    icon: m.image_url ?? "",
    follower_count: 0,
    member_color: m.color ?? undefined,
    entity_type: "member",
    parent_entity_id: SNOW_MAN_GROUP.id,
    parent: {
      id: SNOW_MAN_GROUP.id,
      slug: SNOW_MAN_GROUP.id,
      canonical_name: SNOW_MAN_GROUP.name,
    },
  };
}

/** name_en から Entity を返す (静的マスタで解決) */
export async function fetchEntity(id: string): Promise<Entity> {
  const found = findMember(id);
  if (!found) throw new Error(`Entity not found: ${id}`);
  return {
    id: found.name_en,
    slug: found.name_en,
    canonical_name: found.name,
    names_jsonb: { ja: found.name, en: found.name_en },
    genre: "アイドル",
    country: "JP",
    official_links: [],
    icon: "",
    follower_count: 0,
    member_color: found.color,
    entity_type: "member",
    parent_entity_id: SNOW_MAN_GROUP.id,
    parent: {
      id: SNOW_MAN_GROUP.id,
      slug: SNOW_MAN_GROUP.id,
      canonical_name: SNOW_MAN_GROUP.name,
    },
  };
}

/** メンバー詳細の最新まとめから DailySummary を作る */
export async function fetchDailySummary(id: string): Promise<DailySummary | null> {
  const detail = await apiFetch<RemoteMemberDetail>(
    `/api/summaries/members/${id}`,
  );
  const latest = detail.summaries?.[0];
  if (!latest) return null;
  return {
    entity_id: id,
    date: latest.date,
    summary: latest.summary,
    bullets: latest.bullets ?? [],
    sources: latest.sources ?? [],
    updated_at: latest.created_at ?? null,
  };
}

/** 全 Snow Man メンバーカード一覧 */
export async function fetchMemberCards(): Promise<Entity[]> {
  const res = await apiFetch<RemoteMemberSummaries>(`/api/summaries/members`);
  return (res.members ?? []).map(memberToEntity);
}

/** ホームの人気推し 5 件 */
export async function fetchHomeTopics(): Promise<GlobalTopics> {
  const res = await apiFetch<RemoteMemberSummaries>(`/api/summaries/members`);
  const topics: GlobalTopic[] = (res.members ?? [])
    .filter((m) => m.summary)
    .slice(0, 5)
    .map((m) => ({
      entity_id: m.name_en,
      slug: m.name_en,
      canonical_name: m.name,
      icon: m.image_url,
      summary: m.summary ?? "",
      bullets: [],
      score: 0,
    }));
  return {
    date: new Date().toISOString().slice(0, 10),
    topics,
  };
}

/** グループ全体の今日のまとめ */
export async function fetchGroupTodaySummary(): Promise<DailySummary | null> {
  const res = await apiFetch<RemoteGroupSummary>(`/api/summaries/group/today`);
  if (!res.summary) return null;
  return {
    entity_id: SNOW_MAN_GROUP.id,
    date: res.date ?? new Date().toISOString().slice(0, 10),
    summary: res.summary,
    bullets: res.bullets ?? [],
    sources: res.sources ?? [],
  };
}

/** ダミー: 型シグネチャ互換のため残す */
export async function fetchMembers(_id: string): Promise<MemberSummary[]> {
  return SNOW_MAN_MEMBERS.map((m) => ({
    id: m.name_en,
    slug: m.name_en,
    canonical_name: m.name,
    icon: null,
    follower_count: 0,
  }));
}
