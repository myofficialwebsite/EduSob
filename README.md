# EduSob (এডুসব) — Education For Everyone

Premium dark-editorial landing page + enrollment API for EduSob, a Bengali-first
online learning & career-transformation platform.

## Architecture

- **Frontend** — `frontend/`: React 19 + Tailwind CSS + Framer Motion + Lenis
  smooth scroll + Sonner toasts (CRA/craco build, JS/JSX).
- **Backend** — `backend/`: FastAPI + Motor (async MongoDB). All routes under
  `/api`; course data is seeded automatically on startup.
- **DB** — MongoDB, configured via env vars (see below).

## Run locally

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set MONGO_URL + DB_NAME (see below)
python server.py       # serves on http://0.0.0.0:8000 (PORT env overrides)
```

### Frontend (React)

```bash
cd frontend
npm install   # or: bun install / yarn
npm start     # http://localhost:3000 — /api is proxied to the backend
```

The dev server proxies `/api` to `http://127.0.0.1:8000` (override with
`BACKEND_URL`). If the backend is hosted elsewhere, set
`REACT_APP_BACKEND_URL` (e.g. `https://api.example.com`) and the frontend will
call that origin directly; when unset it falls back to same-origin `/api`.

## Environment variables

| Variable                 | Backend/Frontend | Default                    | Purpose                        |
| ------------------------ | ---------------- | -------------------------- | ------------------------------ |
| `MONGO_URL`              | backend          | `mongodb://127.0.0.1:27017` | MongoDB connection string      |
| `DB_NAME`                | backend          | `edusob`                    | Database name                  |
| `PORT`                   | backend          | `8000`                      | HTTP port                      |
| `CORS_ORIGINS`           | backend          | `*`                         | Comma-separated allowed origins |
| `BACKEND_URL`            | frontend (craco) | `http://127.0.0.1:8000`     | Dev-server proxy target        |
| `REACT_APP_BACKEND_URL`  | frontend (browser)| *(unset)*                 | Overrides the API base origin  |

## API endpoints

| Method | Path                 | Description                                   |
| ------ | -------------------- | --------------------------------------------- |
| GET    | `/api/health`        | Liveness + MongoDB ping (`ok` / `degraded`)   |
| GET    | `/api/courses`       | List courses (`?category=` / `?q=` filters)   |
| GET    | `/api/courses/{id}`  | Single course detail                          |
| POST   | `/api/enroll`        | Enroll: BD phone validation, coupon `EDUSOB2026` (15% off), discounted price |
| POST   | `/api/newsletter`    | Upsert newsletter subscription                |

## Production build

```bash
cd frontend && npm run build   # outputs to frontend/build/
```

## Tests

```bash
cd backend && python -m pytest   # requires pytest-xdist (see pytest.ini)
```