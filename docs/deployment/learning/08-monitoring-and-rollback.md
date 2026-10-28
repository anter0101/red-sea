# Stage 8 — Post-deployment monitoring and rollback

Previous: [atomic traffic switch](07-atomic-traffic-switch.md). Back to the [overview](README.md).

## What this stage is

The new color is public. For a short window the pipeline watches it and, if the health rules fail, points Nginx back at the previous color. The previous containers are still running, and the previous image is still on disk, so rollback is another graceful reload. It is not a rebuild.

The window is a few minutes inside the release job. It is the automatic switch-back. It is not a 24/7 metrics stack. The same signals (access log, health, `docker stats`) are what an operator reads if something degrades later.

## What is watched

`deployment/scripts/watch-release.sh` loops for about three minutes after stage 7:

- `GET /api/health` through Nginx, plus the frontend `/health` on the new color’s loopback port.
- Login with the smoke admin user, then one authenticated API call that Newman already covers (a small GET, not a write).
- Nginx access log: share of HTTP 5xx, and upstream time. The log format in [deployment/nginx/nginx.conf](../../../deployment/nginx/nginx.conf) gains `$request_time` so latency is on each line. Fail the window if the 5xx share crosses the threshold once there are enough samples to judge (the script documents the minimum sample count and the percentage).
- `docker stats --no-stream` for the new backend and frontend containers, recorded in the deploy log. A container that exits or restarts during the window fails the check.

## Rollback

On failure the script calls `switch-color.sh` with the previous color from the pre-switch `active.json`. That runs `nginx -t` and reload again, then writes `active.json` back. The new color’s containers stay up so logs are still there. They stop receiving public traffic.

The next release reuses the idle color. Until then, both images remain. The deploy job does not prune the previous digest.

If stage 7 was the first boot, there is no previous color. The watch script records failure and leaves blue in place, because there is no older upstream to restore.

## Report

The GitHub Actions job summary includes:

- success or rolled back
- active color, git SHA, and both image digests
- links to the Trivy report and the CycloneDX SBOM uploaded in stage 4

Application secrets stay out of that summary.

## VPS bootstrap

This is done once on the new VPS, before the first release, and written in `docs/deployment/github-protection.md` next to the GitHub settings:

- Install Docker and the Compose plugin.
- Create a deploy user that can run Docker, with the SSH public key that matches `DEPLOY_SSH_KEY`.
- Create `/opt/redsea`, and put the Compose files and `.env` there. The release job logs the VPS in to GHCR for each run.
- Open firewall ports 22 and 80.
- Start the shared services (`postgres`, `redis`, `minio`, `nginx`) so the first release only has to start blue.

GitHub secrets for the deploy job are `DEPLOY_HOST`, `DEPLOY_USER`, and `DEPLOY_SSH_KEY`. Database passwords, `APP_SECRET_KEY`, `NEXTAUTH_SECRET`, MinIO keys, and the smoke passwords live only in `/opt/redsea/.env`.

## Done when

- A forced health failure during the window reloads Nginx onto the previous color and records that color in `active.json`.
- The previous image is still present on the VPS after a successful release.
- The Actions summary names the digest that is live and points at the scan and SBOM artifacts.

## Files

- `deployment/scripts/watch-release.sh`
- `deployment/nginx/nginx.conf` (access log includes `request_time`)
- `.github/workflows/release.yml` (SSH steps: prepare idle color, pre-promote, switch, watch, job summary)
- `docs/deployment/github-protection.md` (GitHub settings and VPS bootstrap)
