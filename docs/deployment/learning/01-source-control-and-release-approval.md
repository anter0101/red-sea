# Stage 1 — Source control and release approval

Previous: [overview](README.md). Next: [code quality and tests](02-code-quality-and-tests.md).

## What this stage is

A release starts from a reviewed change on `main`, and a person who is allowed to deploy must approve production before any SSH session touches the VPS.

Three separate gates do that:

- **Feature branch and pull request.** Work lands on `main` through a pull request. Direct pushes to `main` are turned off in GitHub.
- **Review.** GitHub requires at least one approval before the pull request can merge.
- **Production approval.** Publishing a Release, or starting the workflow by hand, is not enough. The deploy job waits on the GitHub Environment named `production`. Only the reviewers configured on that environment can approve it, and only commits that are on `main` can use it.

Branch protection and environment reviewers live in GitHub settings. A workflow file cannot enforce them by itself. The repo will document the exact clicks in `docs/deployment/github-protection.md`, and the workflows will refuse to deploy from any other branch.

## Where Red Sea is today

The remote is GitHub (`anter0101/red-sea`). Nothing in the repo runs on pull requests. Merging and deploying are the same gesture today: someone runs `docker compose up --build` on a machine that has the source tree. There is no record of who approved a production change.

## Plan for this stage

Add two workflows.

| Workflow | When it runs | What it is allowed to do |
| --- | --- | --- |
| `.github/workflows/ci.yml` | Pull request targeting `main` | Lint, test, scan, and a Docker build that is not pushed. No registry write and no SSH. |
| `.github/workflows/release.yml` | GitHub Release whose target is `main`, and `workflow_dispatch` only when `github.ref` is `refs/heads/main` | The same gates, then build, push, and deploy. The deploy job sets `environment: production`. |

GitHub settings to turn on once, written up in `docs/deployment/github-protection.md`:

- Protect `main`: pull request required, at least one approval, required status check `ci`.
- Environment `production`: required reviewers. Allow branch `main` and tags `v*`. A published Release runs as a tag, so a branch-only rule would skip the deploy job. The workflow still rejects a tag whose commit is not on `main`.
- Keep Release publishing limited to people who should be able to start a production run. The environment reviewers are still required after that.

## Done when

- A pull request to `main` runs `ci` and cannot merge until that check and a review succeed.
- A release workflow started from a branch other than `main` does not deploy.
- The deploy job stays pending until a `production` reviewer approves it.
- The pull request workflow has no path to the VPS.

## Files

- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `docs/deployment/github-protection.md`
