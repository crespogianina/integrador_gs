from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from core.config import settings


def normalize_database_url(url: str) -> str:
    """Render entrega postgresql://; SQLAlchemy + psycopg2 requiere postgresql+psycopg2://"""
    if url.startswith("postgresql://") and "+psycopg2" not in url.split("://", 1)[0]:
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


engine = create_engine(normalize_database_url(settings.DATABASE_URL), pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
