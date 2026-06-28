from fastapi import APIRouter

router = APIRouter()


@router.get("/group/today")
async def get_group_summary():
    """Snow Man グループ全体の今日のサマリーを返す。"""
    # TODO: Supabase から daily_summaries (member_id IS NULL) を取得
    return {"summary": "", "date": ""}


@router.get("/members")
async def get_member_summaries():
    """全メンバーの今日のサマリーと直近イベントを返す。"""
    # TODO: Supabase から members + daily_summaries + events を結合して取得
    return {"members": []}


@router.get("/members/{member_name}")
async def get_member_detail(member_name: str):
    """メンバー詳細: 過去サマリー履歴 + 予定一覧を返す。"""
    # TODO: Supabase から member_name に一致するメンバーの履歴を取得
    return {"member": member_name, "summaries": [], "events": []}