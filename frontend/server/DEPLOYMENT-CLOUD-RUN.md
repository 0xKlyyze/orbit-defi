Service: orbit-api (Cloud Run, managed)

Environment variables (set on service):
- LOG_LEVEL=info
- CORS_ORIGINS=your Netlify domain(s), comma-separated
- GEMINI_MODEL=gemini-3-pro-preview
- GEMINI_API_KEY (from Secret Manager or trigger substitution)
- RESEARCH_ENABLED=true
- RESEARCH_PROVIDER=coingecko

Build & Deploy via Cloud Build trigger:
- Image: gcr.io/$PROJECT_ID/orbit-api:latest
- Region: us-central1
- Allow unauthenticated
- Port: 8080
- Min instances: 1, Max instances: 20, Concurrency: 80

Frontend integration:
- Netlify env REACT_APP_BACKEND_URL=https://<service-url>/api
- Keep CORS_ORIGINS aligned with Netlify domain(s)