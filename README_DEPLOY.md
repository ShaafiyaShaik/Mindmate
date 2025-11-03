# MindMate — Deploy & CI notes

This file contains quick commands and steps I performed for deployment prep and what to do next.

Files added by the deployment prep:

- `vercel.json` — Vercel project config
- `DEPLOYMENT.md` — deployment checklist and notes
- `.env.example` — example environment variables
- `scripts/seed_mongo.js` — script to seed demo conversations into MongoDB
- `.gitignore` — ignore node_modules and build artifacts
- `.github/workflows/ci.yml` — CI workflow to run build on push/PR

Quick local commands

1. Install dependencies

```powershell
cd "d:\MindMate(1)\mindmate-app"
npm ci
```

2. Seed demo data into a local MongoDB (if you use MongoDB)

Set the environment variable `MONGODB_URI` and run the seed script:

```powershell
$env:MONGODB_URI = "mongodb://127.0.0.1:27017/mindmate"
node ./scripts/seed_mongo.js
```

3. Run dev server

```powershell
npm run dev
```

Pushing & Vercel

- I pushed branch `deploy/mongo-vercel-clean` to your GitHub repo. Connect the repository in Vercel and set the Project Root to `mindmate-app`.
- Add the environment variables described in `DEPLOYMENT.md` to your Vercel project.

If you want, I can also:

- Open a PR from `deploy/mongo-vercel-clean` into `main`.
- Add a GitHub Actions badge to the README.
