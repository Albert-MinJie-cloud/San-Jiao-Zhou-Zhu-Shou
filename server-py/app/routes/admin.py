from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy import select, text

from app.database import async_session
from app.models import Location, DailyPassword
from app.schemas import (
    RecognizeResult,
    SaveDailyRequest,
    SaveLocationsRequest,
    CreateLocationRequest,
    LocationConfig,
)
from app.auth import require_admin
from app.ocr.recognize import recognize_passwords

router = APIRouter()


async def _get_locations(session) -> list[Location]:
    rows = await session.execute(select(Location).order_by(Location.sort_order))
    return list(rows.scalars().all())


@router.post("/admin/recognize")
async def admin_recognize(
    image: UploadFile = File(...),
    _=Depends(require_admin),
):
    """上传截图，OCR 识别密码"""
    contents = await image.read()
    async with async_session() as session:
        locs = await _get_locations(session)

    name_list = [loc.name for loc in locs]
    items, debug_info = await recognize_passwords(contents, name_list)

    print(f"[Admin] 识别输入: {name_list}", flush=True)
    print(f"[Admin] 识别返回: {items}", flush=True)

    results = []
    for loc in locs:
        hit = None
        for item in items:
            if (
                item["location"] == loc.name
                or item["location"] in loc.name
                or loc.name in item["location"]
            ):
                hit = item
                break
        results.append(
            RecognizeResult(
                locationId=loc.id,
                name=loc.name,
                password=hit["password"] if hit else "",
            )
        )

    return {"results": results, "debug": debug_info}


@router.put("/admin/daily")
async def admin_save_daily(
    body: SaveDailyRequest,
    _=Depends(require_admin),
):
    """保存某天的密码"""
    if not body.date:
        raise HTTPException(400, "参数错误：需要 date")

    async with async_session() as session:
        async with session.begin():
            for entry in body.entries:
                if entry.locationId is None:
                    continue
                pw = entry.password.strip()
                await session.execute(
                    text(
                        "INSERT INTO daily_passwords (date, location_id, password) "
                        "VALUES (:d, :lid, :pw) "
                        "ON CONFLICT(date, location_id) DO UPDATE SET password = :pw2"
                    ),
                    {"d": body.date, "lid": entry.locationId, "pw": pw, "pw2": pw},
                )

    return {"ok": True}


@router.get("/admin/locations")
async def admin_get_locations(_=Depends(require_admin)):
    """获取所有地点配置"""
    async with async_session() as session:
        locs = await _get_locations(session)
    return {
        "locations": [
            LocationConfig(id=loc.id, name=loc.name, guide=loc.guide, imageUrl=loc.image_url)
            for loc in locs
        ]
    }


@router.put("/admin/locations")
async def admin_save_locations(
    body: SaveLocationsRequest,
    _=Depends(require_admin),
):
    """批量更新地点配置"""
    async with async_session() as session:
        async with session.begin():
            for loc in body.locations:
                await session.execute(
                    text("UPDATE locations SET name = :n, guide = :g, image_url = :u WHERE id = :id"),
                    {"n": loc.name, "g": loc.guide, "u": loc.imageUrl, "id": loc.id},
                )
    return {"ok": True}


@router.post("/admin/locations")
async def admin_create_location(
    body: CreateLocationRequest,
    _=Depends(require_admin),
):
    """新增地点"""
    name = body.name.strip()
    if not name:
        raise HTTPException(400, "地点名称不能为空")

    async with async_session() as session:
        async with session.begin():
            row = await session.execute(
                text("SELECT COALESCE(MAX(sort_order), 0) AS s, COALESCE(MAX(id), 0) AS i FROM locations")
            )
            r = row.one()
            new_id = r.i + 1
            sort = r.s + 1

            await session.execute(
                text(
                    "INSERT INTO locations (id, name, guide, image_url, sort_order) "
                    "VALUES (:id, :n, :g, :u, :s)"
                ),
                {"id": new_id, "n": name, "g": body.guide or "", "u": body.imageUrl or "", "s": sort},
            )

    return {
        "location": LocationConfig(id=new_id, name=name, guide=body.guide or "", imageUrl=body.imageUrl or "")
    }


@router.delete("/admin/locations/{location_id}")
async def admin_delete_location(
    location_id: int,
    _=Depends(require_admin),
):
    """删除地点（连带历史密码）"""
    async with async_session() as session:
        async with session.begin():
            await session.execute(
                text("DELETE FROM daily_passwords WHERE location_id = :id"),
                {"id": location_id},
            )
            result = await session.execute(
                text("DELETE FROM locations WHERE id = :id"),
                {"id": location_id},
            )

    if result.rowcount == 0:
        raise HTTPException(404, "地点不存在")

    return {"ok": True}
