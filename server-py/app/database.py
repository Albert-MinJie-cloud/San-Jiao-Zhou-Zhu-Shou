from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from app.config import settings


engine = create_async_engine(settings.database_url, echo=False)
async_session = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def init_db():
    """初始化数据库表结构 + seed 数据"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(_seed_locations)


def _seed_locations(sync_conn):
    """首次启动写入 6 个固定地点"""
    result = sync_conn.execute(text("SELECT COUNT(*) AS c FROM locations")).scalar_one()
    if result > 0:
        return

    data = [
        (1, "零号大坝", "主变电站右侧，进入地下管道后匍匐到通道尽头处"),
        (2, "长弓溪谷", "地图右下角标点附近地下入口"),
        (3, "巴克什", "大浴场北侧"),
        (4, "航天基地", "工业区组装室2楼"),
        (5, "潮汐监狱", "监狱行政区1楼大厅楼梯拐角处"),
        (6, "AZ3", "核电站海水处理区地下-泄漏房角落"),
    ]
    for i, (id_, name, guide) in enumerate(data, 1):
        sync_conn.execute(
            text("INSERT INTO locations (id, name, guide, image_url, sort_order) VALUES (:id, :name, :guide, '', :sort)"),
            {"id": id_, "name": name, "guide": guide, "sort": i},
        )
