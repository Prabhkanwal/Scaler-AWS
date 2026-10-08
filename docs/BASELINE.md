# Baseline (Phase 0)

Snapshot of the submission before the compliance rewrite.

## Stack

- Frontend: Next.js 16 App Router, TypeScript, Tailwind, hand-built AWS-like UI
- Backend: FastAPI + SQLAlchemy + SQLite
- Cloudscape: global-styles/tokens only (no `@cloudscape-design/components`)

## Frontend routes

| Path | Notes |
|------|--------|
| `/` | Dashboard marketing page (auth-gated) |
| `/signin` | AWS-style login |
| `/signup` | Coming soon |
| `/get-started` | Landing cards |
| `/hosted-zones` | List (no auth redirect) |
| `/hosted-zones/create` | Create zone |
| `/hosted-zones/[id]` | Detail + records |
| `/hosted-zones/[id]/edit` | Edit comment |
| `/hosted-zones/[id]/create-record` | Quick create |

No Coming Soon pages for Health checks, Profiles, Resolver, Traffic flow. Sidebar items used `href="#"`.

## Backend endpoints

- `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- `GET/POST /api/hosted-zones/`, `GET/PUT/DELETE /api/hosted-zones/{id}`
- `GET/POST /api/hosted-zones/{id}/records/`, `GET/PUT/DELETE .../records/{record_id}`
- `GET /`

## Deviations vs assignment

1. Cookie `Secure; SameSite=None` breaks localhost HTTP; DB URL hardcoded to `/data/route53.db`.
2. No NS/SOA auto-create or protection; zone delete cascades all records.
3. Record `value` is a flat string; no per-type validation, routing policy, alias, multi-value JSON.
4. No hosted `zone_id`, tags, VPCs; list Hosted zone ID used `Math.random()`.
5. No Cloudscape components; tables lack real sort/preferences/Actions.
6. No BIND import/export, dark-mode toggle, shortcuts, bulk zone delete.
7. No Alembic, tests, `.env.example`, root `.gitignore`; `route53.db` present in tree; no git repo.
8. Sessions never expire.

## Build baseline

- No `node_modules`; `sqlalchemy` not installed in system Python.
- Not a git repository.
- Live demo URLs existed in README (Vercel + Railway).
