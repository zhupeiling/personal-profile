from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from app.api import api_router
from app.core.config import get_settings
from app.db import Base, engine
from app.models import Bookmark, Comment, Dislike, Like, Post, SiteComment, SiteCommentDislike, SiteCommentLike, User  # noqa: F401


settings = get_settings()
UPLOAD_DIR = Path("uploads")


def create_app() -> FastAPI:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    app = FastAPI(title=settings.app_name)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def create_tables() -> None:
        Base.metadata.create_all(bind=engine)
        inspector = inspect(engine)
        if "posts" in inspector.get_table_names():
            columns = {column["name"] for column in inspector.get_columns("posts")}
            if "pdf_url" not in columns:
                with engine.begin() as connection:
                    connection.execute(text("ALTER TABLE posts ADD COLUMN pdf_url VARCHAR(500)"))

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(api_router, prefix=settings.api_prefix)
    app.mount(f"{settings.api_prefix}/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
    return app


app = create_app()
