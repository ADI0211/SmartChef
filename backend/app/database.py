"""SQLAlchemy setup: one SQLite file holds the whole app's data."""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import DATABASE_PATH

engine = create_engine(
    f"sqlite:///{DATABASE_PATH}",
    # SQLite only allows one thread per connection by default; FastAPI's
    # dependency system uses a fresh connection per request so this is safe.
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Base class every ORM model inherits from."""


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
