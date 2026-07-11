import type { EventItem, MemberCard } from "./summary";

export type DemoUser = {
  id: string;
  display_name: string;
  followed_member_ids: string[];
  interests: string[];
};

export type FollowedMemberSummary = {
  member: MemberCard;
  summary: string | null;
  date: string | null;
  bullets: string[];
  next_event: EventItem | null;
};

export type DashboardResponse = {
  user: DemoUser;
  followed: FollowedMemberSummary[];
};
