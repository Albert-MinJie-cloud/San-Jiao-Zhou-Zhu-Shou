from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routes.daily import router as daily_router
from app.routes.admin import router as admin_router

app = FastAPI(title="三角洲行动助手 API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(daily_router, prefix="/api")
app.include_router(admin_router, prefix="/api")


@app.on_event("startup")
async def startup():
    await init_db()
