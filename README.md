# Canine Research Assistant Frontend

React/Vite frontend for the final dog behaviour RAG backend.

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

Set `.env`:

```text
VITE_API_BASE_URL=http://localhost:8000
VITE_BACKEND_API_KEY=
```

If the backend sets `BACKEND_API_KEY`, set `VITE_BACKEND_API_KEY` to the same
value. The app sends it quietly as `X-API-Key`; users do not see a login screen.

## Render Deployment

Create a Render Static Site:

```text
Build command: npm install && npm run build
Publish directory: dist
```

Environment variables:

```text
VITE_API_BASE_URL=https://your-backend-service.onrender.com
VITE_BACKEND_API_KEY=the_same_value_as_backend_BACKEND_API_KEY
```

The backend must allow the frontend origin in `ALLOWED_ORIGINS`.

If the backend is slow to respond after inactivity, the frontend checks
`/api/health` and shows a small "App waking up..." status until it is ready.

## Features

- polished chat interface for scientific dog behaviour questions;
- backend-owned retrieval settings, using the chunk counts selected during evaluation;
- small backend ready/waking status indicator;
- retrieved source paper panel;
- chunk text previews from `/api/search`;
- answer generation from `/api/chat`.

The frontend sends the user question plus the last three visible chat turns to
the backend. This provides lightweight short-term conversational memory for
follow-up questions. Retrieval parameters such as `RETRIEVE_TOP_K`,
`CONTEXT_TOP_N`, and reranking are configured in the backend environment so the
deployed app uses the tested project methodology rather than exposing
methodological controls to end users.

The logo in `src/assets/app-logo.png` is newly generated for this
project and does not reuse the previous protected SciDog/CanAI logo.
