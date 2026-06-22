from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession, ensure_unique_user
from app.core.config import get_settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models import User
from app.schemas.common import Token, UserCreate, UserLogin, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


def safe_next_path(value: str) -> str:
    if not value.startswith("/") or value.startswith("//"):
        return "/blog"
    return value


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: DbSession) -> Token:
    if len(payload.password) < 8:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Password must be at least 8 characters")

    ensure_unique_user(db, payload.email, payload.username)
    user_count = db.scalar(select(User.id).limit(1))
    user = User(
        email=payload.email.lower(),
        username=payload.username,
        password_hash=hash_password(payload.password),
        is_admin=user_count is None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return Token(access_token=create_access_token(str(user.id)), user=UserPublic.model_validate(user))


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: DbSession) -> Token:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    return Token(access_token=create_access_token(str(user.id)), user=UserPublic.model_validate(user))


@router.get("/me", response_model=UserPublic)
def me(user: CurrentUser) -> User:
    return user


@router.get("/github/start")
def github_start(next: str = Query(default="/blog")) -> RedirectResponse:
    settings = get_settings()
    if not settings.github_client_id:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="GitHub login is not configured")

    query = urlencode(
        {
            "client_id": settings.github_client_id,
            "redirect_uri": f"{settings.frontend_url.rstrip('/')}/api/auth/github/callback",
            "scope": "read:user user:email",
            "state": safe_next_path(next),
        }
    )
    return RedirectResponse(f"https://github.com/login/oauth/authorize?{query}")


@router.get("/github/callback")
def github_callback(code: str, db: DbSession, state: str = "/blog") -> RedirectResponse:
    settings = get_settings()
    if not settings.github_client_id or not settings.github_client_secret:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="GitHub login is not configured")

    redirect_uri = f"{settings.frontend_url.rstrip('/')}/api/auth/github/callback"
    with httpx.Client(timeout=10) as client:
        token_response = client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": redirect_uri,
            },
        )
        try:
            token_response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="GitHub login failed") from exc
        github_token = token_response.json().get("access_token")
        if not github_token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="GitHub login failed")

        headers = {"Authorization": f"Bearer {github_token}", "Accept": "application/vnd.github+json"}
        profile_response = client.get("https://api.github.com/user", headers=headers)
        email_response = client.get("https://api.github.com/user/emails", headers=headers)
        try:
            profile_response.raise_for_status()
            email_response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="GitHub login failed") from exc
        profile = profile_response.json()
        emails = email_response.json()

    email = next((item["email"] for item in emails if item.get("primary") and item.get("verified")), None)
    if not email:
        email = f"{profile['id']}+{profile.get('login', 'github')}@users.noreply.github.com"

    user = db.scalar(select(User).where(User.email == email.lower()))
    if not user:
        username_base = profile.get("login") or email.split("@", 1)[0]
        username = username_base
        suffix = 1
        while db.scalar(select(User.id).where(User.username == username)):
            suffix += 1
            username = f"{username_base}-{suffix}"
        user_count = db.scalar(select(User.id).limit(1))
        user = User(
            email=email.lower(),
            username=username,
            password_hash=hash_password(create_access_token(f"github:{profile['id']}")),
            is_admin=user_count is None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(str(user.id))
    next_path = safe_next_path(state)
    separator = "&" if "?" in next_path else "?"
    return RedirectResponse(f"{settings.frontend_url.rstrip('/')}{next_path}{separator}token={token}")
