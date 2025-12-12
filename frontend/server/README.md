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

## Notes

- All responses validated with Zod.
- Errors return safe fallbacks to avoid UI breakage.