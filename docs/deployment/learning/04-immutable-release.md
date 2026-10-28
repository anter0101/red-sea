# Stage 4 — Build and publish an immutable release

Previous: [vulnerability audit](03-vulnerability-audit.md). Next: [inactive environment](05-inactive-environment.md).

## What this stage is

The release image is built once. Every later step deploys that same image. Deployment does not run `docker compose build`, and it does not run `pnpm build` again on the VPS.

An image tag is a movable label. A digest is the hash of the image contents (`sha256:…`). The pipeline records the digest and the VPS starts `image: name@sha256:…`. Moving the tag to another build cannot change what production runs.

The scan in this stage is of that image id, after `docker build` and before `docker push`. The SBOM is the list of packages inside that same image, in CycloneDX, kept with the workflow artifacts for 90 days. If the image scan fails, nothing is pushed and stages 5–8 do not run.

## Where Red Sea is today

[deployment/docker-compose.yml](../../../deployment/docker-compose.yml) builds backend and frontend from the local directories every time the stack starts. The resulting image has no registry name. The backend Dockerfile `EXPOSE`s 3000 while the process listens on `PORT` (8080 in the deployment env). Nginx proxies to `backend:8080`. The port that matters is the process port, not the `EXPOSE` line.

The frontend image must be built with the public URLs, because `NEXT_PUBLIC_*` values are compiled into the browser bundle. Those values come from GitHub Actions variables at release time, matching the URL the VPS will serve.

## Plan for this stage

The release workflow, after stages 2 and 3 succeed:

1. Build `ghcr.io/<owner>/red-sea-backend` and `ghcr.io/<owner>/red-sea-frontend`.
2. Tag each image with the full git SHA. When the trigger is a GitHub Release, also tag the release version. The deploy pin is the digest, not the tag.
3. Frontend build args: `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_BACKEND_URL` only.
4. Trivy-scan those image ids. Fail on critical and high OS or library CVEs.
5. Write a CycloneDX SBOM per image (`trivy image --format cyclonedx`).
6. Upload the Trivy report and the SBOM as workflow artifacts, retained 90 days.
7. Push to GHCR. The deploy job pulls the digest. Production Compose has no `build:` key.

Pull-request `docker build` from stage 2 is a separate validation build. It is not retagged and shipped. Only the release workflow’s image is promoted.

`GITHUB_TOKEN` with `packages: write` pushes to GHCR for this repository. The VPS pulls with the same token. The job logs the VPS in to GHCR before the release script and logs it out afterwards.

## Done when

- One release produces one backend digest and one frontend digest.
- The digest that Trivy scanned is the digest the VPS pulls.
- A failed image scan leaves GHCR unchanged.
- The Actions run keeps the SBOM and the scan report.

## Files

- `.github/workflows/release.yml` (build, scan, SBOM, push)
- `backend/Dockerfile` and `frontend/Dockerfile` (build inputs; runtime env stays in Compose)
- GitHub Actions variables `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_BACKEND_URL`
