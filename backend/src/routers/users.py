"""サンプルユーザー用のダッシュボード API。

ログイン機能なしでパーソナライズ体験を提供するため、demo_users テーブルに
seed した「代表ペルソナ」の情報を返す。ユーザーがフォロー中の推し全員の
最新まとめと直近予定を横断的に取得する。
"""

from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from src.schemas.summary import EventDTO, MemberCardDTO
from src.schemas.user import DashboardResponse, DemoUserDTO, FollowedMemberSummaryDTO
from src.services.supabase_client import get_supabase_client

router = APIRouter()


@router.get("/{user_id}/dashboard", response_model=DashboardResponse)
async def get_user_dashboard(
    user_id: str, supabase: Client = Depends(get_supabase_client)
):
    """フォロー中の推しの今日のまとめ + 直近予定を横断取得する。"""
    user_row = (
        supabase.table("demo_users").select("*").eq("id", user_id).limit(1).execute()
    )
    if not user_row.data:
        raise HTTPException(status_code=404, detail=f"user not found: {user_id}")
    user = user_row.data[0]
    member_ids: list[str] = user["followed_member_ids"] or []

    if not member_ids:
        return DashboardResponse(
            user=DemoUserDTO(**user),
            followed=[],
        )

    members_result = (
        supabase.table("members").select("*").in_("id", member_ids).execute()
    )
    members = members_result.data or []

    summaries_result = (
        supabase.table("daily_summaries")
        .select("member_id, summary, date, bullets")
        .in_("member_id", member_ids)
        .order("date", desc=True)
        .execute()
    )
    latest_by_member: dict[str, dict] = {}
    for row in summaries_result.data or []:
        mid = row["member_id"]
        if mid not in latest_by_member:
            latest_by_member[mid] = row

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
        mid = row["member_id"]
        if mid not in next_event_by_member:
            next_event_by_member[mid] = row

    followed: list[FollowedMemberSummaryDTO] = []
    for m in members:
        summary_row = latest_by_member.get(m["id"])
        event_row = next_event_by_member.get(m["id"])
        followed.append(
            FollowedMemberSummaryDTO(
                member=MemberCardDTO(
                    id=m["id"],
                    name=m["name"],
                    name_en=m["name_en"],
                    image_url=m.get("image_url"),
                    color=m.get("color"),
                ),
                summary=summary_row["summary"] if summary_row else None,
                date=summary_row["date"] if summary_row else None,
                bullets=(summary_row.get("bullets") or []) if summary_row else [],
                next_event=EventDTO(**event_row) if event_row else None,
            )
        )

    return DashboardResponse(user=DemoUserDTO(**user), followed=followed)
