from fastapi import APIRouter

from app.api import auth, comments, posts

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(comments.router)
api_router.include_router(posts.router)
