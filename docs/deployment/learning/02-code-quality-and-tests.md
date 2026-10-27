# Stage 2 — Code quality and automated tests

Previous: [source control and release approval](01-source-control-and-release-approval.md). Next: [vulnerability audit](03-vulnerability-audit.md).

## What this stage is

Before a change merges, and again before a release is published, the pipeline proves the code still typechecks, lints, and passes its tests. A failed critical check stops the workflow. Later stages never start.

“Critical” here means the commands below exit non-zero: lint, typecheck, unit tests, coverage below the baseline, the auth tests, or a Docker build that does not finish. Coverage is collected so a later change cannot silently drop it.

Two kinds of tests stay in different places on purpose:

- **On the pull request:** tests that do not need a real database. They run on a GitHub-hosted runner from the lockfile.
- **On the inactive color, stage 6:** tests that need a running API and seeded data (Newman). The pull request runner does not boot PostgreSQL, Redis, and MinIO for those.

## Where Red Sea is today

Each app has its own `pnpm-lock.yaml`. There is no root workspace.

Backend scripts in [backend/package.json](../../../backend/package.json):

- `lint` runs ESLint with `--fix`, which is useful locally and wrong in CI (CI must not rewrite the tree).
- `test` and `test:cov` run Jest. Specs live under `backend/src/**/*.spec.ts`. Many controller specs replace `AuthGuard` with a mock, so they do not prove that a missing token is rejected.
- `test:e2e` boots the full `AppModule` in [backend/test/app.e2e-spec.ts](../../../backend/test/app.e2e-spec.ts), which opens TypeORM and BullMQ. That needs a real Postgres and Redis, so it is not a pull-request gate.
- There is no `typecheck` script. `nest build` is the typecheck we already trust, and CI will also run `tsc --noEmit`.

Frontend scripts in [frontend/package.json](../../../frontend/package.json): `lint` (`next lint`), `test` (Jest), `build`. [frontend/CLAUDE.md](../../../frontend/CLAUDE.md) mentions `test:coverage` and a 70% threshold. [frontend/jest.config.ts](../../../frontend/jest.config.ts) does not define that script or that threshold, and the current suite does not cover 70% of the app. Enforcing 70% would leave `main` red. The gate is the measured baseline of the suite we actually have, rounded down, so a drop fails and the existing tests still pass.

[backend/scripts/run-newman-smoke.mjs](../../../backend/scripts/run-newman-smoke.mjs) logs in as `admin@admin.com` / `12345` and then runs the Postman folders `auth`, `Office Requests`, and `Journey Delegation Print`. Those passwords should not be the CI contract. Stage 6 passes `SMOKE_ADMIN_*` and `SMOKE_EMPLOYEE_*` from the VPS environment.

## Plan for this stage

Both `ci.yml` and `release.yml` run this, with `pnpm install --frozen-lockfile` in `backend/` and `frontend/`:

- Backend: ESLint without `--fix`, `tsc --noEmit`, `pnpm test`, `pnpm test:cov`.
- Frontend: `pnpm lint`, `tsc --noEmit`, `pnpm test`, coverage from Jest.
- Set `coverageThreshold` in each Jest config to the measured baseline, rounded down. Backend global floor: statements 36, branches 30, functions 19, lines 37. Frontend floor, on files the suite imports: statements 74, branches 62, functions 67, lines 75.
- Add auth tests under `backend/src/app/modules/auth/` that use the real guards: a missing or invalid JWT returns 401, and a token with the wrong role returns 403.
- On the pull request, parse [backend/red-sea.postman.json](../../../backend/red-sea.postman.json) and fail if it is not valid JSON. Executing the collection waits until stage 6.
- Change the Newman smoke script to read smoke users from the environment.
- Pull requests also run `docker build` for both Dockerfiles and do not push. That is the build check. The release build in stage 4 is the image that ships.

## Done when

- A lint error, a type error, a failing unit test, or a coverage drop fails the pull request and the release.
- Auth tests fail when the guards are bypassed or removed.
- The Newman script has no hard-coded password.
- The full-app e2e file is unchanged and is not required for merge.

## Files

- `.github/workflows/ci.yml` and `.github/workflows/release.yml` (test jobs)
- `backend/package.json`, backend Jest config, new auth specs
- `frontend/package.json`, `frontend/jest.config.ts`
- `backend/scripts/run-newman-smoke.mjs`
