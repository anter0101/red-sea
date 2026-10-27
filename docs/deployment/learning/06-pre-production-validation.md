# Stage 6 — Pre-production validation

Previous: [inactive environment](05-inactive-environment.md). Next: [atomic traffic switch](07-atomic-traffic-switch.md).

## What this stage is

The new color is running and has no production traffic yet. This stage asks it to prove the process is up, the database and Redis answer, login works, and a short set of API calls succeed. Authenticated DAST then looks for runtime issues the source scanners cannot see, such as missing auth on a live route.

Any failed check aborts the deploy. The script does not edit Nginx. The previous color stays live.

Checks run against the inactive loopback ports from stage 5 (`127.0.0.1:18080` / `13000`, or the green pair). They do not go through public Nginx.

## Health routes

The backend has no `/health` route today. Tire `healthPercentage` in the domain model is unrelated.

Add `GET /api/health` on the Nest app. It is public (no JWT). It runs `SELECT 1` through TypeORM and `PING` against Redis. Success returns 200 with `status`, `db`, `redis`, `color`, and `sha`. Either dependency failing returns 503. The release SHA and color come from `APP_RELEASE_SHA` and `APP_COLOR`.

Add `GET /health` on the Next.js app. It returns 200 when the Node server is up.

Nginx already sends `/api/*` to the backend, except `/api/auth/`, which stays on Next.js. A frontend probe under `/api/health` would hit Nest. `/health` on the frontend and `/api/health` on the backend keep those apart. Stage 6 calls the loopback ports, so each process is reached directly. Stage 7 calls `/api/health` through Nginx to prove the public path.

## Smoke and DAST

`deployment/scripts/pre-promote.sh` waits until the inactive backend and frontend healthchecks pass, then:

1. `GET` both health URLs and require 200.
2. Run Newman via [backend/scripts/run-newman-smoke.mjs](../../../backend/scripts/run-newman-smoke.mjs) with `BASE_URL` set to the inactive backend loopback port. Folders stay `auth`, `Office Requests`, and `Journey Delegation Print`. Users come from `SMOKE_ADMIN_EMAIL`, `SMOKE_ADMIN_PASSWORD`, `SMOKE_EMPLOYEE_EMAIL`, and `SMOKE_EMPLOYEE_PASSWORD` on the VPS.
3. Run OWASP ZAP (the stable `zaproxy` image) against the inactive loopback origin. The automation plan logs in with `POST /api/auth/login`, then walks a short allowlist of API paths with that token. High alerts fail the script. Medium alerts are saved with the deploy logs.

Public Nginx is the wrong ZAP target. The bot map in [deployment/nginx/nginx.conf](../../../deployment/nginx/nginx.conf) returns 403 for user agents that match ZAP, nuclei, sqlmap, and similar scanners. Loopback ports are not behind that map.

## Where a failure stops

`pre-promote.sh` exits non-zero on the first failed step. The GitHub Actions deploy job stops. `switch-color.sh` is not called. `/opt/redsea/state/active.json` still names the old color. The new containers can stay up for inspection; they receive no public traffic.

## Done when

- Unhealthy database or Redis keeps the old color live.
- A failed login, a failed Newman folder, or a high ZAP alert does the same.
- A healthy idle color is the only path into stage 7.

## Files

- Backend health controller and module registration in `backend/src/app/`
- `frontend/src/app/health/route.ts` (App Router `GET /health`)
- `deployment/scripts/pre-promote.sh`
- `deployment/zap/api-auth.yaml` (ZAP automation plan)
- `backend/scripts/run-newman-smoke.mjs` (env credentials, from stage 2)
