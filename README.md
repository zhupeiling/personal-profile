# Peiling Zhu Personal Blog

Full-stack personal blog scaffold:

- `frontend/`: React + Vite personal site and blog UI
- `backend/`: FastAPI API with users, posts, comments, likes, and bookmarks
- `docker-compose.yml`: PostgreSQL + backend + frontend for one-command migration/deployment

## Local Frontend

```bash
cd frontend
npm install
npm run dev
```

## Local Backend

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

## Container Deployment

```bash
docker compose up --build
```

The frontend is available at `http://localhost:8080`, and the API at `http://localhost:8000`.
