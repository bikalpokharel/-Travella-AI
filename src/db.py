from __future__ import annotations

import os
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Text,
    Index,
)
from sqlalchemy.orm import declarative_base, sessionmaker


DB_URL = os.getenv("DATABASE_URL", "sqlite:///./travella.db")

# SQLite needs check_same_thread=False for threaded servers
engine = create_engine(
    DB_URL,
    connect_args={"check_same_thread": False} if DB_URL.startswith("sqlite") else {},
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

Base = declarative_base()


class Video(Base):
    __tablename__ = "videos"
    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(100), index=True, nullable=False)
    platform = Column(String(32), index=True, nullable=False)
    url = Column(Text, nullable=False, unique=False)
    trending_score = Column(Float, default=0.0)
    title = Column(String(255), nullable=True)
    thumbnail = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_videos_city_platform_time", "city", "platform", "last_updated"),
    )


class Hotel(Base):
    __tablename__ = "hotels"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), index=True, nullable=False)
    city = Column(String(100), index=True, nullable=False)
    price = Column(Float, nullable=True)
    budget_range = Column(String(32), nullable=True)
    package = Column(String(255), nullable=True)
    provider = Column(String(64), nullable=True)
    deeplink = Column(Text, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)


class Flight(Base):
    __tablename__ = "flights"
    id = Column(Integer, primary_key=True)
    origin = Column(String(100), index=True, nullable=False)
    destination = Column(String(100), index=True, nullable=False)
    price = Column(Float, nullable=True)
    airline = Column(String(64), nullable=True)
    provider = Column(String(64), nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)


class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), index=True, nullable=False)
    city = Column(String(100), index=True, nullable=False)
    price = Column(Float, nullable=True)
    provider = Column(String(64), nullable=True)
    url = Column(Text, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


