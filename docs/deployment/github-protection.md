# GitHub protection for production

One-time settings for `anter0101/red-sea`. Workflow files cannot turn these on. An admin applies them in the GitHub UI. VPS bootstrap (Docker, SSH, `/opt/redsea`) is stage 8.

The workflows in this repo:

- [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) runs on a pull request into `main`. The check name to require is `ci`. It does not push an image and it does not SSH.
- [`.github/workflows/release.yml`](../../.github/workflows/release.yml) runs when a Release is published, or when someone starts it by hand. The `guard` job accepts a manual run only from `main`, and accepts a Release only when the tagged commit is on `main`. The `deploy` job uses the `production` environment. After approval it builds both images, scans them, pushes the digests to GHCR, then SSHs to the VPS. The VPS starts only the idle color, checks it, switches Nginx, and watches for about three minutes.

## Protect `main`

Settings → Rules → Rulesets → New ruleset → New branch ruleset.

- Name: `protect-main`
- Enforcement: Active
- Target branches: include the default branch, or branch name `main`
- Restrict deletions
- Block force pushes
- Require a pull request before merging, at least 1 approval
- Require status checks to pass, required check `ci`
- Include administrators, so a direct push to `main` is rejected for everyone

The `ci` check appears in the list after the first pull request runs `.github/workflows/ci.yml`. Add it once that run exists.

## Environment `production`

Settings → Environments → New environment → name `production`.

- Required reviewers: the people allowed to approve a production deploy
- Deployment branches and tags: selected branches and tags
  - Branch: `main` (manual run)
  - Tag: `v*` (a published Release runs as `refs/tags/…`, so a branch-only rule would skip the deploy job)

The workflow still rejects a tag whose commit is not on `main`. Reviewers are required after that check passes. With a single admin, leave “Prevent self-review” off, or that admin can never approve their own release. Turn it on when two people can approve.

## Who can start a release

Write access on the repo can publish a Release. Keep Write to the people who may start production. The environment reviewers still have to approve before `deploy` runs.

## Actions variables and GHCR

Settings → Secrets and variables → Actions → Variables:

- `NEXT_PUBLIC_APP_URL` — public app origin compiled into the frontend image, such as `http://203.0.113.10`
- `NEXT_PUBLIC_BACKEND_URL` — public API origin compiled into the same image

The release job stops before `docker build` when either variable is empty. These are not secrets. `NEXTAUTH_SECRET` stays on the VPS and is not a build arg.

Settings → Actions → General → Workflow permissions: Read and write permissions.

The workflow files still set their own `permissions`. Pull-request CI only requests `contents: read`, so it cannot push packages. The release `deploy` job requests `packages: write`, which `GITHUB_TOKEN` uses to push to GHCR. A repository setting of “Read repository contents” ignores that request and the push fails. After the first successful push, confirm the two packages are linked to this repository and are not public unless that is intended. The VPS read login is a separate credential stored on the server. It is not this token.

## VPS bootstrap

Do this once on the new Linux VPS, before the first release.

- Install Docker, the Compose plugin, python3, and curl.
- Create a deploy user that can run Docker. Put the SSH public key for `DEPLOY_SSH_KEY` in that user's `authorized_keys`.
- Create `/opt/redsea`. The release job copies Compose, Nginx, and the scripts there. It does not copy `.env`.
- Put the real `.env` at `/opt/redsea/.env` from [deployment/.env.example](../../deployment/.env.example). Keep `DATABASE_SYNCHRONIZE=false`. Fill the database, Redis, MinIO, `APP_SECRET_KEY`, `NEXTAUTH_SECRET`, and the four `SMOKE_*` values.
- `docker login ghcr.io` as a user that can pull these packages. That login stays on the VPS.
- Open firewall ports 22 and 80 only. The color ports bind to `127.0.0.1`.
- From `/opt/redsea`, start the shared services: `docker compose up -d postgres redis minio minio-init`. The first release starts Nginx if it is not already running, after it writes an upstream file that names the blue containers. Starting Nginx earlier fails while those names do not exist.

GitHub secrets on the `production` environment:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY` (the private key, including the BEGIN and END lines)

Database passwords, `APP_SECRET_KEY`, `NEXTAUTH_SECRET`, MinIO keys, and the smoke passwords stay in `/opt/redsea/.env`. The workflow does not print them.

## Check that it works

1. Open a pull request into `main` and confirm the `ci` check runs.
2. Push straight to `main` and confirm GitHub rejects it.
3. Run `release` by hand from a branch other than `main`. `guard` fails and GitHub does not ask for production approval.
4. Run `release` by hand from `main`. `deploy` stays waiting until a `production` reviewer approves. The job then builds, scans, and pushes. A critical or high CVE fails the job and leaves GHCR unchanged. After a clean scan the job SSHs to the VPS, starts the idle color, and the summary names the live color, SHA, and both digests, with links to the scan report and the SBOM.
