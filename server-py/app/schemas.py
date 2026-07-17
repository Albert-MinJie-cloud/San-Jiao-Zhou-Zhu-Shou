from pydantic import BaseModel
from typing import Optional


class DailyEntry(BaseModel):
    id: int
    name: str
    guide: str
    imageUrl: str
    password: str


class DailyData(BaseModel):
    date: Optional[str] = None
    entries: list[DailyEntry]


class LocationConfig(BaseModel):
    id: int
    name: str
    guide: str
    imageUrl: str


class RecognizeResult(BaseModel):
    locationId: int
    name: str
    password: str


class SaveDailyEntry(BaseModel):
    locationId: int
    password: str


class SaveDailyRequest(BaseModel):
    date: str
    entries: list[SaveDailyEntry]


class SaveLocationsRequest(BaseModel):
    locations: list[LocationConfig]


class CreateLocationRequest(BaseModel):
    name: str
    guide: str = ""
    imageUrl: str = ""
