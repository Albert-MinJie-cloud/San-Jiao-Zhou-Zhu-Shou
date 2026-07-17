from fastapi import APIRouter, Query
from sqlalchemy import select, text

from app.database import async_session
from app.models import Location, DailyPassword
from app.schemas import DailyData, DailyEntry

router = APIRouter()


@router.get("/daily")
async def get_daily(date: str = Query(None)):
    """获取每日密码（默认最新一天，可指定 ?date=YYYY-MM-DD）"""
    async with async_session() as session:
        if not date:
            result = await session.execute(
                text("SELECT MAX(date) FROM daily_passwords")
            )
            date = result.scalar()

        passwords: dict[int, str] = {}
        if date:
            rows = await session.execute(
                text("SELECT location_id, password FROM daily_passwords WHERE date = :d"),
                {"d": date},
            )
            for row in rows:
                passwords[row[0]] = row[1]

        locs = await session.execute(
            select(Location).order_by(Location.sort_order)
        )
        entries = [
            DailyEntry(
                id=loc.id,
                name=loc.name,
                guide=loc.guide,
                imageUrl=loc.image_url,
                password=passwords.get(loc.id, ""),
            )
            for loc in locs.scalars().all()
        ]

        return DailyData(date=date, entries=entries)


@router.get("/history")
async def get_history():
    """获取有密码记录的日期列表（倒序）"""
    async with async_session() as session:
        rows = await session.execute(
            text("SELECT DISTINCT date FROM daily_passwords ORDER BY date DESC")
        )
        return {"dates": [r[0] for r in rows]}
