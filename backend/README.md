# Graph Save API (backend)

Minimal Express API for saving/loading graph connections. Used by the frontend’s “Save / Load” (no password, token-based).

## Deploy to Sliplane

1. In Sliplane, create a **new service** (separate from the frontend).
2. Point it at this repo and set the **Dockerfile path** to `Dockerfile.api` (build context = repo root).
3. Set **port** to `3001` (or whatever `PORT` you set in the service env).
4. Optional: add a **volume** for `/app/data` if you want saved data to persist across redeploys.

## Local

From repo root:

```bash
docker build -f Dockerfile.api -t graph-api .
docker run -p 3001:3001 graph-api
```

## Frontend

When the frontend is hosted elsewhere, point it at this API by setting the API base URL (e.g. your Sliplane backend URL) in the app so `/api` requests go to the backend.
