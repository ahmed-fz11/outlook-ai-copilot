from urllib.parse import urlparse, unquote

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


def _make_engine():
    if not settings.DATABASE_URL:
        return None
    # Parse and fully decode the URL so special chars in the password
    # (like + and &) are passed correctly to psycopg2.
    parsed = urlparse(settings.DATABASE_URL)
    connect_url = URL.create(
        drivername="postgresql+psycopg2",
        username=unquote(parsed.username or ""),
        password=unquote(parsed.password or ""),
        host=parsed.hostname,
        port=parsed.port,
        database=(parsed.path or "/postgres").lstrip("/"),
    )
    return create_engine(
        connect_url,
        pool_pre_ping=True,       # test connection before using it
        pool_recycle=300,         # recycle connections every 5 minutes
        pool_size=5,
        max_overflow=10,
        connect_args={"connect_timeout": 10},
    )


engine = _make_engine()
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False) if engine else None


class Base(DeclarativeBase):
    pass


def get_db():
    if SessionLocal is None:
        raise RuntimeError("DATABASE_URL is not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
