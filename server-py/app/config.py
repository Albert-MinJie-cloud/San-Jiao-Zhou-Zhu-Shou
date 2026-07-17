import os
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    port: int = 8000
    admin_token: str = ""
    database_url: str = f"sqlite+aiosqlite:///{Path(__file__).parent.parent / 'data' / 'app.db'}"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
os.makedirs(Path(settings.database_url.replace("sqlite+aiosqlite:///", "")).parent, exist_ok=True)
