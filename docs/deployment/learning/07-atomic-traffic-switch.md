# Stage 7 — Atomic traffic switch

Previous: [pre-production validation](06-pre-production-validation.md). Next: [monitoring and rollback](08-monitoring-and-rollback.md).

## What this stage is

Nginx is the only public HTTP entry. Switching traffic means changing which color Nginx proxies to, checking that the config is valid, and reloading Nginx without dropping listening sockets. Reload is graceful: existing connections finish on the old workers, new connections use the new upstream.

The switch is one file write plus `nginx -t` plus `nginx -s reload`. If `nginx -t` fails, the script does not reload, and the previous file stays in place.

After reload, a request through port 80 must show the new color and the new SHA. The script then records that fact on disk so the next release knows which color is idle.

## Why the upstream file is generated

Today both upstreams are hard-coded in [deployment/nginx/nginx.conf](../../../deployment/nginx/nginx.conf):

```nginx
upstream frontend_upstream {
    server frontend:3000;
}
upstream backend_upstream {
    server backend:8080;
}
```

A static file that names both colors breaks when one color is stopped, because Nginx resolves those names when it loads the config. The live config should name only the active color: `backend-blue:8080` and `frontend-blue:3000`, or the green pair.

`nginx.conf` keeps the `server` block, the MinIO and Postgres stream config, and the bot map. It includes a generated file for the two upstreams. That generated file is a bind mount the deploy script replaces. The image of Nginx does not change.

## Plan for this stage

`deployment/scripts/switch-color.sh <blue|green>`:

1. Read the new backend digest, frontend digest, and git SHA from the environment (the same values stage 4 pushed and stage 5 started).
2. Write the upstream file so `backend_upstream` is `backend-<color>:8080` and `frontend_upstream` is `frontend-<color>:3000`.
3. `docker exec` the Nginx container: `nginx -t`. On failure, restore the previous upstream file and exit non-zero.
4. `nginx -s reload`.
5. `GET http://127.0.0.1/api/health` and require `color` and `sha` to match this release.
6. Write `/opt/redsea/state/active.json`:

```json
{
  "color": "green",
  "backendDigest": "sha256:…",
  "frontendDigest": "sha256:…",
  "gitSha": "…",
  "switchedAt": "2026-10-27T14:00:00Z"
}
```

The Postgres stream upstream (`postgres:5432`) stays in the static config. Database export does not move with the app color.

First boot has no `active.json`. Stage 5 prepared blue. This script’s first successful run records blue.

## Done when

- Public `/api/health` reports the color that passed stage 6, and the SHA of the digest that was scanned.
- A bad upstream file does not reload Nginx.
- `active.json` matches the color Nginx is using.
- MinIO and the Postgres export listener are unchanged.

## Files

- `deployment/nginx/nginx.conf` (include the generated upstreams; leave routing rules in place)
- `deployment/nginx/upstreams.conf.template`
- `deployment/scripts/switch-color.sh`
- Compose volume mount for the generated upstream file into the Nginx container
