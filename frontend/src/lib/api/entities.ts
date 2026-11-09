/**
 * ハッカソン用エンティティ API 層。
 * oshiwatch-ai バックエンド (`/api/summaries/*`) のレスポンスを
 * 本家 UI コンポーネントが期待する Entity / DailySummary 形式に変換する。
 */

import { apiFetch } from "./client";
import { OSHI_LIST, OSHI_GROUPS, findOshi } from "@/lib/data/oshi-list";
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

function memberToEntity(m: RemoteMemberCard, group?: string): Entity {
  const staticData = findOshi(m.name_en);
  return {
    id: m.name_en,
    slug: m.name_en,
    canonical_name: m.name,
    names_jsonb: { ja: m.name, en: m.name_en },
    genre: "アイドル",
    country: staticData?.group === "SEVENTEEN" ? "KR" : "JP",
    official_links: [],
    icon: m.image_url ?? "",
    follower_count: 0,
    member_color: m.color ?? staticData?.color ?? undefined,
    entity_type: "member",
    parent_entity_id: staticData?.group ?? group ?? "",
    parent: staticData
      ? {
          id: staticData.group.toLowerCase().replace(/\s+/g, "-"),
          slug: staticData.group.toLowerCase().replace(/\s+/g, "-"),
          canonical_name: staticData.group,
        }
      : null,
  };
}

/** name_en から Entity を返す (静的マスタで解決) */
export async function fetchEntity(id: string): Promise<Entity> {
  const found = findOshi(id);
  if (!found) throw new Error(`Entity not found: ${id}`);
  return {
    id: found.name_en,
    slug: found.name_en,
    canonical_name: found.name,
    names_jsonb: { ja: found.name, en: found.name_en },
    genre: "アイドル",
    country: found.group === "SEVENTEEN" ? "KR" : "JP",
    official_links: [],
    icon: "",
    follower_count: 0,
    member_color: found.color,
    entity_type: "member",
    parent_entity_id: found.group.toLowerCase().replace(/\s+/g, "-"),
    parent: {
      id: found.group.toLowerCase().replace(/\s+/g, "-"),
      slug: found.group.toLowerCase().replace(/\s+/g, "-"),
      canonical_name: found.group,
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

/** 全メンバーカード一覧 (backend が返す全推し) */
export async function fetchMemberCards(): Promise<Entity[]> {
  const res = await apiFetch<RemoteMemberSummaries>(`/api/summaries/members`);
  return (res.members ?? []).map((m) => memberToEntity(m));
}

/** ホームの人気推し 5 件 */
export async function fetchHomeTopics(): Promise<GlobalTopics> {
  const res = await apiFetch<RemoteMemberSummaries>(`/api/summaries/members`);
  const topics: GlobalTopic[] = (res.members ?? [])
    .filter((m) => m.summary)
    .slice(0, 2)
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
    entity_id: "group",
    date: res.date ?? new Date().toISOString().slice(0, 10),
    summary: res.summary,
    bullets: res.bullets ?? [],
    sources: res.sources ?? [],
  };
}

export async function fetchMembers(_id: string): Promise<MemberSummary[]> {
  return OSHI_LIST.map((m) => ({
    id: m.name_en,
    slug: m.name_en,
    canonical_name: m.name,
    icon: null,
    follower_count: 0,
  }));
}
