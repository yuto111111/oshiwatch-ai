from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from src.schemas.summary import (
    EventDTO,
    GroupSummaryResponse,
    MemberCardDTO,
    MemberDetailResponse,
    MemberSummariesResponse,
    SummaryHistoryDTO,
)
from src.services.supabase_client import get_supabase_client

router = APIRouter()


@router.get("/group/today", response_model=GroupSummaryResponse)
async def get_group_summary(supabase: Client = Depends(get_supabase_client)):
    """Snow Man グループ全体の最新サマリーを返す（member_id IS NULL の行）。"""
    result = (
        supabase.table("daily_summaries")
        .select("summary, date, bullets, sources")
        .is_("member_id", "null")
        .order("date", desc=True)
        .limit(1)
        .execute()
    )
    if not result.data:
        return GroupSummaryResponse(summary="", date=None)

    row = result.data[0]
    return GroupSummaryResponse(
        summary=row["summary"],
        date=row["date"],
        bullets=row.get("bullets") or [],
        sources=row.get("sources") or [],
    )


@router.get("/members", response_model=MemberSummariesResponse)
async def get_member_summaries(supabase: Client = Depends(get_supabase_client)):
    """全メンバーの最新サマリーと直近イベントを返す。"""
    members_result = supabase.table("members").select("*").execute()
    members = members_result.data or []
    member_ids = [m["id"] for m in members]

    summaries_result = (
        supabase.table("daily_summaries")
        .select("member_id, summary, date")
        .in_("member_id", member_ids)
        .order("date", desc=True)
        .execute()
    )
    latest_summary_by_member: dict[str, dict] = {}
    for row in summaries_result.data or []:
        member_id = row["member_id"]
        if member_id not in latest_summary_by_member:
            latest_summary_by_member[member_id] = row

    today = date.today().isoformat()
    events_result = (
        supabase.table("events")
        .select("*")
        .in_("member_id", member_ids)
        .gte("event_date", today)
        .order("event_date", desc=False)
        .execute()
    )
    next_event_by_member: dict[str, dict] = {}
    for row in events_result.data or []:
        member_id = row["member_id"]
        if member_id not in next_event_by_member:
            next_event_by_member[member_id] = row

    cards = []
    for member in members:
        summary_row = latest_summary_by_member.get(member["id"])
        event_row = next_event_by_member.get(member["id"])
        cards.append(
            MemberCardDTO(
                id=member["id"],
                name=member["name"],
                name_en=member["name_en"],
                image_url=member.get("image_url"),
                color=member.get("color"),
                summary=summary_row["summary"] if summary_row else None,
                next_event=EventDTO(**event_row) if event_row else None,
            )
        )

    return MemberSummariesResponse(members=cards)


@router.get("/members/{member_name}", response_model=MemberDetailResponse)
async def get_member_detail(member_name: str, supabase: Client = Depends(get_supabase_client)):
    """メンバー詳細: 過去サマリー履歴 + 予定一覧を返す（member_name は name_en スラッグ）。"""
    member_result = (
        supabase.table("members").select("*").eq("name_en", member_name).limit(1).execute()
    )
    if not member_result.data:
        raise HTTPException(status_code=404, detail=f"member not found: {member_name}")
    member = member_result.data[0]

    summaries_result = (
        supabase.table("daily_summaries")
        .select("summary, date, created_at, bullets, sources")
        .eq("member_id", member["id"])
        .order("date", desc=True)
        .execute()
    )
    events_result = (
        supabase.table("events")
        .select("*")
        .eq("member_id", member["id"])
        .order("event_date", desc=False)
        .execute()
    )

    return MemberDetailResponse(
        member=MemberCardDTO(
            id=member["id"],
            name=member["name"],
            name_en=member["name_en"],
            image_url=member.get("image_url"),
            color=member.get("color"),
        ),
        summaries=[SummaryHistoryDTO(**row) for row in (summaries_result.data or [])],
        events=[EventDTO(**row) for row in (events_result.data or [])],
    )
