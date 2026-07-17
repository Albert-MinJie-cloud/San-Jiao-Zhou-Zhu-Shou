from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    guide = Column(String, nullable=False, default="")
    image_url = Column(String, nullable=False, default="")
    sort_order = Column(Integer, nullable=False)


class DailyPassword(Base):
    __tablename__ = "daily_passwords"

    date = Column(String, primary_key=True)
    location_id = Column(Integer, ForeignKey("locations.id"), primary_key=True)
    password = Column(String, nullable=False)
