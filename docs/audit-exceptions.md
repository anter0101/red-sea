# Dependency audit exceptions

CI runs `pnpm audit --audit-level=high` for `backend` and `frontend`.

## Ignored: CVE-2026-112366 (GHSA-fc5q-39xc-vjpf), picomatch

- **Severity:** high. ReDoS through single-branch repeated extglobs.
- **Affected:** `picomatch <=4.0.7`. No patched version exists yet.
- **Where it comes from:** build and test tooling only. In backend, `@nestjs/cli` through `@angular-devkit`. In frontend, `jest`, `eslint` and `tinyglobby`. It is not used to match untrusted input at runtime.
- **Decision:** ignored through `pnpm.auditConfig.ignoreCves` in both `backend/package.json` and `frontend/package.json`.
- **Review:** remove the entry once a patched `picomatch` is published or the affected tooling is upgraded.

## Not blocking

Moderate findings are reported but do not fail CI: `glob` (CVE-2026-118773), `minimatch` (CVE-2026-118764), and `uuid` (CVE-2026-41907, via `exceljs`).
