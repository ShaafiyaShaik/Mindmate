# Deploying MindMate (mindmate-app) to Vercel

This document lists the recommended steps, environment variables, and caveats for deploying the `mindmate-app` Next.js application to Vercel.

## High-level steps

1. Push your repository to GitHub (or connect your Git provider to Vercel).
2. On Vercel, create a new Project and import the repository.
   - Set the Project Root to `mindmate-app` (so Vercel builds that folder).
3. Add the required Environment Variables (see list below).
4. Deploy.

Vercel will detect Next.js and use the default build: `npm run build` from the `mindmate-app` folder.

## Required environment variables

Add these to Vercel (Project Settings → Environment Variables). Keep secrets private.

- `GEMINI_API_KEY` (required if you want real Gemini responses)
- `GEMINI_API_ENDPOINT` (optional override of the Gemini endpoint)
- `JWT_SECRET` (required for JWT auth; set to a long random string)
- `DB_CLIENT` (optional — set to `mongodb` to use MongoDB; default is `sqlite` locally)
- `MONGODB_URI` (required if `DB_CLIENT=mongodb`. e.g. connection string from MongoDB Atlas)
- `MONGODB_DBNAME` (optional — database name; defaults to `mindmate`)
- `DB_FILE` (optional when using SQLite; not recommended for Vercel — filesystem is ephemeral)

Notes:
- Do NOT commit any secret values into the repo.
- If you choose `DB_CLIENT=sqlite` and rely on `DB_FILE`, Vercel's serverless environment does not provide durable disk storage between invocations — SQLite is not suitable for production on Vercel.

## Recommended production architecture

1. Use `DB_CLIENT=mongodb` and a managed MongoDB (Atlas). Set `MONGODB_URI` and `MONGODB_DBNAME` in Vercel.
2. Keep AI keys and JWT secret in Vercel Environment Variables.
3. For real-time features:
   - SSE endpoints are supported on long-lived servers but can be problematic on serverless function platforms because of instance lifecycle and connection limits.
   - For production, prefer a managed realtime provider (Pusher, Ably, Supabase Realtime) or run a small persistent WebSocket/SSE server (e.g., on Render, Fly, or a Docker host) and connect the Next.js API routes to that service for broadcasting events.

## Seeding demo data

If you migrate to MongoDB you can import the demo conversation JSON files using the provided seeding script:

1. Set `MONGODB_URI` and (optional) `MONGODB_DBNAME` locally or in the shell.
2. Run `node ./scripts/seed_mongo.js` from the `mindmate-app` folder.

The script will read `data/conversations/*.json` and insert documents into `conversations` and `messages` collections.

## Additional notes & troubleshooting

- API timeouts: Vercel serverless functions have default execution limits. If your Gemini calls take long, consider using background jobs or a hosted AI-processing service.
- SSE behavior: Client reconnection and heartbeats are implemented in the app, but at scale use a dedicated realtime service.
- If you want, I can: add a `vercel.json` (done), add a GitHub Actions workflow to run tests on push, or convert `db.ts` to prefer MongoDB usage patterns more explicitly.

---

If you'd like I can also prepare a branch that
- switches the default `DB_CLIENT` to `mongodb`,
- wires `MONGODB_URI` references into `.env.example`, and
- adds a simple GitHub Actions that runs `npm ci && npm run build` to validate the build on PRs.
