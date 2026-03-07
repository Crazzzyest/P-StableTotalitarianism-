# Graph Save API (backend)

Minimal Express API: register/login (username + password, stored plainly) and save/load graph per user. Session token returned on login/register; use `Authorization: Bearer <token>` for save/load.

## Deploy to Sliplane (two services)

You need **two separate services**:

1. **Frontend** – your existing app (Dockerfile → nginx serving the SPA). Its Public Endpoint is the site users visit.
2. **Backend (this API)** – create a **new** service:
   - Same repo; set **Dockerfile path** to `Dockerfile.api` (build context = repo root).
   - Expose port **3001**.
   - After deploy, copy this service’s **Public Endpoint** (e.g. `https://your-api-name.sliplane.app`).

Set `VITE_API_URL` **at build time** (Vite bakes it in). In Sliplane, add a **build argument** for the frontend: `VITE_API_URL` = `https://your-backend-public-endpoint.sliplane.app`  
(use the **backend** service’s URL, not the frontend). Rebuild and redeploy the frontend so login/save/load hit the API.

## Local

From repo root:

```bash
docker build -f Dockerfile.api -t graph-api .
docker run -p 3001:3001 graph-api
```

## Frontend

When the frontend is hosted elsewhere, point it at this API by setting the API base URL (e.g. your Sliplane backend URL) in the app so `/api` requests go to the backend.
