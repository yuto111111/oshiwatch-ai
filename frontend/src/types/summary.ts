export type Source = {
  title: string;
  url: string;
};

export type GroupSummary = {
  summary: string;
  date: string | null;
  bullets: string[];
  sources: Source[];
};

export type EventItem = {
  id: string;
  title: string;
  event_date: string;
  description: string | null;
  source_url: string | null;
};

export type MemberCard = {
  id: string;
  name: string;
  name_en: string;
  image_url: string | null;
  color: string | null;
  summary: string | null;
  next_event: EventItem | null;
};

export type MemberSummaries = {
  members: MemberCard[];
};

export type SummaryHistoryItem = {
  summary: string;
  date: string;
  created_at: string | null;
  bullets: string[];
  sources: Source[];
};

export type MemberDetail = {
  member: MemberCard;
  summaries: SummaryHistoryItem[];
  events: EventItem[];
};
