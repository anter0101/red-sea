# GitHub settings for production

One-time settings for `anter0101/red-sea`. This repository is private on a free account. Rulesets, branch protection, and environment reviewers are not available, so nothing in GitHub blocks a direct push or waits for a reviewer. The workflow `guard` job is what limits a release to a commit on `main`.

The workflows in this repo:

- [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) runs on every push to `main` and on a pull request into `main`. It runs test, then audit. It does not build Docker images, push, or SSH.
- [`.github/workflows/release.yml`](../../.github/workflows/release.yml) runs when a Release is published, or when someone starts it by hand from `main`. The `guard` job rejects any ref that is not on `main`. There is no `production` environment. When guard passes, `deploy` builds each image once, pushes the digests to GHCR, then SSHs to the VPS. Let `ci` finish green on that commit before you release. The VPS starts only the idle color, checks it, switches Nginx, and watches for about three minutes.

## Who can push and release

Anyone with Write access can push to `main` and can publish a Release. Keep Write to the people who may change production. `docs/deployment/protect-main-ruleset.json` is the ruleset for a later public repository or a paid plan. Importing it on this private repository does not enforce it.

## Actions variables and GHCR

Settings → Secrets and variables → Actions → Variables:

- `NEXT_PUBLIC_APP_URL` — public app origin compiled into the frontend image, such as `http://203.0.113.10`
- `NEXT_PUBLIC_BACKEND_URL` — public API origin compiled into the same image

The release job stops before `docker build` when either variable is empty. These are not secrets. `NEXTAUTH_SECRET` stays on the VPS and is not a build arg.

Settings → Actions → General → Workflow permissions: Read and write permissions.

The workflow files still set their own `permissions`. Pull-request CI only requests `contents: read`, so it cannot push packages. The release `deploy` job requests `packages: write`, which `GITHUB_TOKEN` uses to push to GHCR. A repository setting of “Read repository contents” ignores that request and the push fails. After the first successful push, confirm the two packages are linked to this repository and are not public unless that is intended. The VPS pulls with this same token: `deploy` logs the VPS in to GHCR before the release script and logs it out afterwards, so no registry credential stays on the server.

## VPS bootstrap

Do this once on the new Linux VPS, before the first release.

- Install Docker, the Compose plugin, python3, and curl.
- Create a deploy user that can run Docker. Put the SSH public key for `DEPLOY_SSH_KEY` in that user's `authorized_keys`.
- Create `/opt/redsea`. The release job copies Compose, Nginx, and the scripts there. It does not copy `.env`.
- Put the real `.env` at `/opt/redsea/.env` from [deployment/.env.example](../../deployment/.env.example). Keep `DATABASE_SYNCHRONIZE=false`. Fill the database, Redis, MinIO, `APP_SECRET_KEY`, `NEXTAUTH_SECRET`, the four `SMOKE_*` values, and the two `SEED_*` passwords. The seed passwords must match the smoke passwords.
- Open firewall ports 22 and 80 only. The color ports bind to `127.0.0.1`.
- From `/opt/redsea`, start the shared services: `docker compose up -d postgres redis minio minio-init`. The first release starts Nginx if it is not already running, after it writes an upstream file that names the blue containers. Starting Nginx earlier fails while those names do not exist.

GitHub repository secrets, under Settings → Secrets and variables → Actions → Secrets. Do not put them on an environment. This plan cannot use environment secrets.

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY` (the private key, including the BEGIN and END lines)

Database passwords, `APP_SECRET_KEY`, `NEXTAUTH_SECRET`, MinIO keys, and the smoke passwords stay in `/opt/redsea/.env`. The workflow does not print them.

## Check that it works

1. Push to `main` and confirm the `ci` workflow starts on that push.
2. Run `release` by hand from a branch other than `main`. `guard` fails and `deploy` does not run.
3. Run `release` by hand from `main` after `ci` is green on that commit. Nobody has to approve it. The job builds each image once, pushes them, SSHs to the VPS, starts the idle color, and the summary names the live color, SHA, and both digests.
