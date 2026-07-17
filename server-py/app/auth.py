from fastapi import Header, HTTPException
from app.config import settings


async def require_admin(authorization: str = Header(None)):
    """Bearer token 认证中间件"""
    token = settings.admin_token
    if not token:
        raise HTTPException(500, "服务端未配置 ADMIN_TOKEN")
    if not authorization:
        raise HTTPException(401, "缺少 Authorization 头")
    if authorization != f"Bearer {token}":
        raise HTTPException(401, "密钥错误")
