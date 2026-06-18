from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserPublic(BaseModel):
    id: int
    email: str
    username: str
    is_admin: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class UserCreate(BaseModel):
    email: str
    username: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class PostBase(BaseModel):
    title: str
    slug: str
    summary: str = ""
    content: str
    cover_image: str | None = None
    published: bool = True


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    summary: str | None = None
    content: str | None = None
    cover_image: str | None = None
    published: bool | None = None


class PostPublic(PostBase):
    id: int
    author: UserPublic
    created_at: datetime
    updated_at: datetime
    comments_count: int = 0
    likes_count: int = 0
    bookmarks_count: int = 0
    liked_by_me: bool = False
    bookmarked_by_me: bool = False

    model_config = ConfigDict(from_attributes=True)


class CommentCreate(BaseModel):
    content: str


class CommentPublic(BaseModel):
    id: int
    post_id: int
    author: UserPublic
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InteractionState(BaseModel):
    post_id: int
    liked: bool
    bookmarked: bool
    likes_count: int
    bookmarks_count: int
