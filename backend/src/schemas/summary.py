from datetime import date, datetime

from pydantic import BaseModel


class SourceDTO(BaseModel):
    title: str
    url: str


class GroupSummaryResponse(BaseModel):
    summary: str
    date: str | None = None
    bullets: list[str] = []
    sources: list[SourceDTO] = []


class EventDTO(BaseModel):
    id: str
    title: str
    event_date: date
    description: str | None = None
    source_url: str | None = None


class MemberCardDTO(BaseModel):
    id: str
    name: str
    name_en: str
    image_url: str | None = None
    color: str | None = None
    summary: str | None = None
    next_event: EventDTO | None = None


class MemberSummariesResponse(BaseModel):
    members: list[MemberCardDTO]


class SummaryHistoryDTO(BaseModel):
    summary: str
    date: date
    created_at: datetime | None = None
    bullets: list[str] = []
    sources: list[SourceDTO] = []


class MemberDetailResponse(BaseModel):
    member: MemberCardDTO
    summaries: list[SummaryHistoryDTO]
    events: list[EventDTO]
