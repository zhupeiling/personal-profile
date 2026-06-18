from sqlalchemy import select

from app.core.security import hash_password
from app.db import Base, SessionLocal, engine
from app.models import Post, User


def run() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == "peiling@example.com"))
        if not user:
            user = User(
                email="peiling@example.com",
                username="peiling",
                password_hash=hash_password("peiling123"),
                is_admin=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        if not db.scalar(select(Post).where(Post.slug == "hello-neuroai")):
            db.add(
                Post(
                    slug="hello-neuroai",
                    title="从 NeuroAI 开始",
                    summary="把模型、大脑和真实世界智能放在同一张图里理解。",
                    content=(
                        "这是第一篇示例博客。后续可以在这里记录论文阅读、实验日志、"
                        "模型比较、校园 AI 工具和那些正在形成的问题。"
                    ),
                    cover_image="/pictures/食既九连.png",
                    author_id=user.id,
                    published=True,
                )
            )
            db.commit()


if __name__ == "__main__":
    run()
