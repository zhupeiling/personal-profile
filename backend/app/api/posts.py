from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentUser, DbSession, OptionalUser, require_post_owner_or_admin
from app.models import Bookmark, Comment, Dislike, Like, Post
from app.schemas.common import CommentCreate, CommentPublic, InteractionState, PostCreate, PostPublic, PostUpdate

router = APIRouter(prefix="/posts", tags=["posts"])
PDF_DIR = Path("uploads/pdfs")


def enrich_post(post: Post, db: DbSession, viewer: OptionalUser = None) -> PostPublic:
    result = PostPublic.model_validate(post)
    result.comments_count = db.scalar(select(func.count(Comment.id)).where(Comment.post_id == post.id)) or 0
    result.likes_count = db.scalar(select(func.count(Like.id)).where(Like.post_id == post.id)) or 0
    result.dislikes_count = db.scalar(select(func.count(Dislike.id)).where(Dislike.post_id == post.id)) or 0
    result.bookmarks_count = db.scalar(select(func.count(Bookmark.id)).where(Bookmark.post_id == post.id)) or 0

    if viewer:
        result.liked_by_me = bool(db.scalar(select(Like.id).where(Like.post_id == post.id, Like.user_id == viewer.id)))
        result.disliked_by_me = bool(db.scalar(select(Dislike.id).where(Dislike.post_id == post.id, Dislike.user_id == viewer.id)))
        result.bookmarked_by_me = bool(db.scalar(select(Bookmark.id).where(Bookmark.post_id == post.id, Bookmark.user_id == viewer.id)))

    return result


@router.get("", response_model=list[PostPublic])
def list_posts(
    db: DbSession,
    viewer: OptionalUser,
    q: str | None = Query(default=None, max_length=120),
    include_drafts: bool = False,
) -> list[PostPublic]:
    stmt = select(Post).options(selectinload(Post.author)).order_by(Post.created_at.desc())
    if not include_drafts or not (viewer and viewer.is_admin):
        stmt = stmt.where(Post.published.is_(True))
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(Post.title.ilike(like), Post.summary.ilike(like), Post.content.ilike(like)))

    posts = db.scalars(stmt).all()
    return [enrich_post(post, db, viewer) for post in posts]


@router.post("", response_model=PostPublic, status_code=status.HTTP_201_CREATED)
def create_post(payload: PostCreate, db: DbSession, user: CurrentUser) -> PostPublic:
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can create posts")

    existing = db.scalar(select(Post).where(Post.slug == payload.slug))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    post = Post(**payload.model_dump(), author_id=user.id)
    db.add(post)
    db.commit()
    db.refresh(post)
    post.author = user
    return enrich_post(post, db, user)


@router.post("/upload-pdf")
async def upload_pdf(user: CurrentUser, file: UploadFile = File(...)) -> dict[str, str]:
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can upload PDFs")
    filename_hint = (file.filename or "").lower()
    if file.content_type != "application/pdf" and not filename_hint.endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are supported")

    PDF_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}.pdf"
    target = PDF_DIR / filename
    content = await file.read()
    target.write_bytes(content)
    return {"url": f"/api/uploads/pdfs/{filename}"}


@router.get("/{slug}", response_model=PostPublic)
def get_post(slug: str, db: DbSession, viewer: OptionalUser) -> PostPublic:
    post = db.scalar(select(Post).where(Post.slug == slug).options(selectinload(Post.author)))
    if not post or (not post.published and not (viewer and (viewer.is_admin or viewer.id == post.author_id))):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return enrich_post(post, db, viewer)


@router.patch("/{post_id}", response_model=PostPublic)
def update_post(post_id: int, payload: PostUpdate, db: DbSession, user: CurrentUser) -> PostPublic:
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can update posts")
    require_post_owner_or_admin(post.author_id, user)

    data = payload.model_dump(exclude_unset=True)
    if "slug" in data:
        duplicate = db.scalar(select(Post).where(Post.slug == data["slug"], Post.id != post.id))
        if duplicate:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    for key, value in data.items():
        setattr(post, key, value)

    db.commit()
    db.refresh(post)
    return enrich_post(post, db, user)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: DbSession, user: CurrentUser) -> None:
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can delete posts")
    require_post_owner_or_admin(post.author_id, user)
    db.delete(post)
    db.commit()


@router.get("/{post_id}/comments", response_model=list[CommentPublic])
def list_comments(post_id: int, db: DbSession) -> list[Comment]:
    return db.scalars(
        select(Comment)
        .where(Comment.post_id == post_id)
        .options(selectinload(Comment.author))
        .order_by(Comment.created_at.asc())
    ).all()


@router.post("/{post_id}/comments", response_model=CommentPublic, status_code=status.HTTP_201_CREATED)
def create_comment(post_id: int, payload: CommentCreate, db: DbSession, user: CurrentUser) -> Comment:
    if not db.get(Post, post_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    comment = Comment(post_id=post_id, author_id=user.id, content=payload.content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    comment.author = user
    return comment


def interaction_state(post_id: int, db: DbSession, user: CurrentUser) -> InteractionState:
    liked = bool(db.scalar(select(Like.id).where(Like.post_id == post_id, Like.user_id == user.id)))
    disliked = bool(db.scalar(select(Dislike.id).where(Dislike.post_id == post_id, Dislike.user_id == user.id)))
    bookmarked = bool(db.scalar(select(Bookmark.id).where(Bookmark.post_id == post_id, Bookmark.user_id == user.id)))
    return InteractionState(
        post_id=post_id,
        liked=liked,
        disliked=disliked,
        bookmarked=bookmarked,
        likes_count=db.scalar(select(func.count(Like.id)).where(Like.post_id == post_id)) or 0,
        dislikes_count=db.scalar(select(func.count(Dislike.id)).where(Dislike.post_id == post_id)) or 0,
        bookmarks_count=db.scalar(select(func.count(Bookmark.id)).where(Bookmark.post_id == post_id)) or 0,
    )


@router.post("/{post_id}/like", response_model=InteractionState)
def toggle_like(post_id: int, db: DbSession, user: CurrentUser) -> InteractionState:
    if not db.get(Post, post_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    existing = db.scalar(select(Like).where(Like.post_id == post_id, Like.user_id == user.id))
    if existing:
        db.delete(existing)
    else:
        opposite = db.scalar(select(Dislike).where(Dislike.post_id == post_id, Dislike.user_id == user.id))
        if opposite:
            db.delete(opposite)
        db.add(Like(post_id=post_id, user_id=user.id))
    db.commit()
    return interaction_state(post_id, db, user)


@router.post("/{post_id}/dislike", response_model=InteractionState)
def toggle_dislike(post_id: int, db: DbSession, user: CurrentUser) -> InteractionState:
    if not db.get(Post, post_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    existing = db.scalar(select(Dislike).where(Dislike.post_id == post_id, Dislike.user_id == user.id))
    if existing:
        db.delete(existing)
    else:
        opposite = db.scalar(select(Like).where(Like.post_id == post_id, Like.user_id == user.id))
        if opposite:
            db.delete(opposite)
        db.add(Dislike(post_id=post_id, user_id=user.id))
    db.commit()
    return interaction_state(post_id, db, user)


@router.post("/{post_id}/bookmark", response_model=InteractionState)
def toggle_bookmark(post_id: int, db: DbSession, user: CurrentUser) -> InteractionState:
    if not db.get(Post, post_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    existing = db.scalar(select(Bookmark).where(Bookmark.post_id == post_id, Bookmark.user_id == user.id))
    if existing:
        db.delete(existing)
    else:
        db.add(Bookmark(post_id=post_id, user_id=user.id))
    db.commit()
    return interaction_state(post_id, db, user)
