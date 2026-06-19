from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentUser, DbSession, OptionalUser
from app.models import SiteComment, SiteCommentDislike, SiteCommentLike
from app.schemas.common import SiteCommentCreate, SiteCommentInteractionState, SiteCommentPublic

router = APIRouter(prefix="/comments", tags=["comments"])


def enrich_comment(comment: SiteComment, db: DbSession, viewer: OptionalUser = None) -> SiteCommentPublic:
    result = SiteCommentPublic.model_validate(comment)
    result.likes_count = db.scalar(select(func.count(SiteCommentLike.id)).where(SiteCommentLike.comment_id == comment.id)) or 0
    result.dislikes_count = db.scalar(select(func.count(SiteCommentDislike.id)).where(SiteCommentDislike.comment_id == comment.id)) or 0

    if viewer:
        result.liked_by_me = bool(
            db.scalar(select(SiteCommentLike.id).where(SiteCommentLike.comment_id == comment.id, SiteCommentLike.user_id == viewer.id))
        )
        result.disliked_by_me = bool(
            db.scalar(select(SiteCommentDislike.id).where(SiteCommentDislike.comment_id == comment.id, SiteCommentDislike.user_id == viewer.id))
        )

    return result


@router.get("", response_model=list[SiteCommentPublic])
def list_site_comments(db: DbSession, viewer: OptionalUser) -> list[SiteCommentPublic]:
    comments = db.scalars(
        select(SiteComment)
        .options(selectinload(SiteComment.author))
        .order_by(SiteComment.created_at.desc())
    ).all()
    return [enrich_comment(comment, db, viewer) for comment in comments]


@router.post("", response_model=SiteCommentPublic, status_code=status.HTTP_201_CREATED)
def create_site_comment(payload: SiteCommentCreate, db: DbSession, user: CurrentUser) -> SiteCommentPublic:
    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Comment cannot be empty")

    comment = SiteComment(author_id=user.id, content=content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    comment.author = user
    return enrich_comment(comment, db, user)


def interaction_state(comment_id: int, db: DbSession, user: CurrentUser) -> SiteCommentInteractionState:
    liked = bool(db.scalar(select(SiteCommentLike.id).where(SiteCommentLike.comment_id == comment_id, SiteCommentLike.user_id == user.id)))
    disliked = bool(db.scalar(select(SiteCommentDislike.id).where(SiteCommentDislike.comment_id == comment_id, SiteCommentDislike.user_id == user.id)))
    return SiteCommentInteractionState(
        comment_id=comment_id,
        liked=liked,
        disliked=disliked,
        likes_count=db.scalar(select(func.count(SiteCommentLike.id)).where(SiteCommentLike.comment_id == comment_id)) or 0,
        dislikes_count=db.scalar(select(func.count(SiteCommentDislike.id)).where(SiteCommentDislike.comment_id == comment_id)) or 0,
    )


@router.post("/{comment_id}/like", response_model=SiteCommentInteractionState)
def toggle_site_comment_like(comment_id: int, db: DbSession, user: CurrentUser) -> SiteCommentInteractionState:
    if not db.get(SiteComment, comment_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

    existing = db.scalar(select(SiteCommentLike).where(SiteCommentLike.comment_id == comment_id, SiteCommentLike.user_id == user.id))
    if existing:
        db.delete(existing)
    else:
        opposite = db.scalar(select(SiteCommentDislike).where(SiteCommentDislike.comment_id == comment_id, SiteCommentDislike.user_id == user.id))
        if opposite:
            db.delete(opposite)
        db.add(SiteCommentLike(comment_id=comment_id, user_id=user.id))

    db.commit()
    return interaction_state(comment_id, db, user)


@router.post("/{comment_id}/dislike", response_model=SiteCommentInteractionState)
def toggle_site_comment_dislike(comment_id: int, db: DbSession, user: CurrentUser) -> SiteCommentInteractionState:
    if not db.get(SiteComment, comment_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

    existing = db.scalar(select(SiteCommentDislike).where(SiteCommentDislike.comment_id == comment_id, SiteCommentDislike.user_id == user.id))
    if existing:
        db.delete(existing)
    else:
        opposite = db.scalar(select(SiteCommentLike).where(SiteCommentLike.comment_id == comment_id, SiteCommentLike.user_id == user.id))
        if opposite:
            db.delete(opposite)
        db.add(SiteCommentDislike(comment_id=comment_id, user_id=user.id))

    db.commit()
    return interaction_state(comment_id, db, user)
