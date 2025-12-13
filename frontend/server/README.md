# Orbit DeFi Backend Migration (Node/TypeScript)

This folder hosts the migrated backend logic inside the frontend application using Express, TypeScript (strict), Zod validation, Firebase Admin, and Gemini AI.

## Setup

- Copy your Firebase service account JSON to `frontend/server/firebase_credentials.json` or set `FIREBASE_CREDENTIALS_PATH`.
- Create `.env` in `frontend/server` based on `.env.example` and set `GEMINI_API_KEY`.

## Scripts

- `npm run api:start` – start the API on `API_PORT` (default 4000).
- Ensure the React app has `REACT_APP_BACKEND_URL` set to `http://localhost:4000/api` for local development.

## Endpoints

- `GET /api/` root.
- `GET /api/health` health check.
- `GET /api/dashboard/stats` aggregated portfolio stats.
- `GET /api/dashboard/insights` AI insights and risk metrics (cached for 7 days).
- `POST /api/dashboard/chat` chat responses from Orbit AI.
- `POST /api/dashboard/generate-analysis` run analysis based on provided data.
 - `GET /api/dashboard/health/auth` verifies auth token and returns user context.
 - `POST /api/dashboard/migrate-ai-analyses` one-time timestamp normalization for legacy `ai_analyses`.
 - `POST /api/dashboard/migrate-legacy-to-user` copy all legacy collections into `users/{uid}`.

## Notes

- All responses validated with Zod.
- Errors return safe fallbacks to avoid UI breakage.

## Migration

For one-time migration of legacy top-level collections into a specific user’s subcollections (`users/{uid}`), use:

1) Set `MIGRATION_SECRET` in `frontend/server/.env` (optional, but recommended).

2) Run the endpoint with a body specifying the target uid:

```bash
curl -X POST "http://localhost:4000/api/dashboard/migrate-legacy-to-user" \
  -H "Content-Type: application/json" \
  -H "x-migration-secret: <your-secret>" \
  -d '{"uid":"wqxLREJERpbtJsWIuupVnyuTHQl1"}'
```

This copies documents from `ai_analyses`, `ai_chats`, `portfolio_snapshots`, `positions`, `cex_positions`, `loops` and snapshot meta (`portfolio_snapshot_meta`/`portfolio_snapshots_meta`) to `users/{uid}/...`.

The endpoint returns a summary of copied and skipped counts per collection. Skips occur when a document with the same ID already exists under the user.