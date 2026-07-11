from pydantic import BaseModel

from src.schemas.summary import EventDTO, MemberCardDTO


class DemoUserDTO(BaseModel):
    id: str
    display_name: str
    followed_member_ids: list[str]
    interests: list[str]


class FollowedMemberSummaryDTO(BaseModel):
    """ユーザーがフォローしているメンバー 1 名分のサマリー + 次の予定 (ダッシュボード用)。"""

    member: MemberCardDTO
    summary: str | None = None
    date: str | None = None
    bullets: list[str] = []
    next_event: EventDTO | None = None


class DashboardResponse(BaseModel):
    user: DemoUserDTO
    followed: list[FollowedMemberSummaryDTO]
