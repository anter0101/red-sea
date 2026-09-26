# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build (also runs on pre-commit)
pnpm lint         # ESLint
pnpm format       # Prettier on src/**
pnpm test         # Jest (jsdom)
pnpm test:coverage # Jest with coverage report (threshold: 70%)
```

To run a single test file:

```bash
pnpm test -- src/path/to/__tests__/file.test.ts
```

Pre-commit hook (Husky) automatically runs `prettier`, `lint`, and `build` — all three must pass before a commit lands.

## Environment Variables

Copy `.env.example` to `.env.local`:

```
NEXTAUTH_SECRET=...
NEXT_PUBLIC_BACKEND_URL=...   # Base URL for the backend API
NEXT_PUBLIC_APP_URL=...
```

## Architecture

### Routing & Locale

All routes live under `src/app/[locale]/`. The middleware (`src/middleware.ts`) redirects bare paths to the default locale (`ar`) and enforces auth — unauthenticated users go to `/{locale}/login`, authenticated users accessing login are sent to `/{locale}/trips`.

Two route groups:

- `(auth)` — public pages: login, forgot-password, reset-password
- `(loggedIn)` — protected pages with the app shell (Header + SideMenu)

Supported locales: `en`, `ar` (default `ar`). Message files live in `messages/{locale}/{namespace}.json`. Use `getLocaleMessages(locale, namespace)` from `src/i18n/i18n-helpers.ts` in server components to load namespaced translations.

### Authentication

NextAuth v5 (`next-auth@5.0.0-beta`) with a credentials provider. Sessions are JWT, max age 7 days. The session token is stored in the `session.token` field and injected into Axios headers by `AuthTokenProvider` (`src/components/providers/auth-token.tsx`), which wraps the entire logged-in layout.

Auth entry points: `src/app/[locale]/authentication/auth.ts` exports `auth`, `signIn`, `signOut`.

### HTTP Client

`src/lib/client.ts` — Axios instance with:

- Base URL from `NEXT_PUBLIC_BACKEND_URL`
- Default headers: `X-TENANT-ID: dms`, `Accept-Language` set per-request by base hooks
- 60-second timeout

### Data Fetching (TanStack Query)

Base hooks in `src/hooks/base/` wrap Axios + React Query:

| Hook                                    | Pattern            | Use case                                                      |
| --------------------------------------- | ------------------ | ------------------------------------------------------------- |
| `useGetAll`                             | `useInfiniteQuery` | Infinite-scroll lists                                         |
| `useGetPaginated`                       | `useQuery`         | Paginated tables with page/pageSize params                    |
| `useGetOne`                             | `useQuery`         | Single-item detail                                            |
| `useCreate` / `useUpdate` / `useDelete` | `useMutation`      | Mutations, auto-invalidate `queryKey`, toast on success/error |

Feature-level API hooks (e.g., `src/features/branches/api/create.ts`) call these base hooks with a specific `endPoint` and `queryKey`.

### Feature Structure

Each domain follows this layout:

```
src/features/{feature}/
  api/          # One file per API call, wraps base hooks
  components/   # React components scoped to this feature
  hooks/        # Page-level orchestration hooks
  types/        # Zod schemas + inferred types
  enums/        # Domain enums
  utils/        # Pure helpers (e.g., Excel export)
  store/        # Zustand stores (only for multi-step forms with persisted state)
  constants/    # Static data
  mappers/      # Field mapping for display
```

Current features: `branches`, `cars`, `clients`, `drivers`, `driver-assistants`, `employees`, `expenses`, `partners`, `suppliers`, `trailers`, `trips`, `warehouse`, `gps`, `accounting` (accounts, transactions, transaction-lines, reports).

### Forms

Simple forms use React Hook Form + Zod via `@hookform/resolvers/zod`. Multi-step forms come in two flavors:

- **Zustand-persisted** (drivers, driver-assistants): form state survives page refresh via `localStorage`; store is in `features/{feature}/store/`.
- **Local state wizard** (cars): `CarFormWizard` manages step + entity ID in component state, each step fetches/updates the partial entity.

### Tables

`DataTable` (`src/components/main-table/data-table.tsx`) — TanStack Table with dnd-kit for column drag-reorder. Column order is persisted to the backend via `pageKey`. Use `useGetPaginated` for the data source and pass `columns: ColumnDef[]` from a co-located `columns.tsx`.

### Shared Components

- `src/components/ui/` — Radix-based primitives (shadcn/ui style)
- `src/components/common/` — App-specific reusables (EntityHeader, ReusableCard, EntitiesToolbar, TablePagination, BreadCrumb, etc.)
- `src/components/layout/` — Header, SideMenu, UserMenu
- `src/components/providers/main.tsx` — Root provider tree: SessionProvider → NextIntlClientProvider → QueryClientProvider → ShadcnProvider

### State Management

TanStack Query owns server state. Zustand is used only for multi-step create flows where partial data must survive navigation between steps (persisted to localStorage, file images excluded from persistence).

### Path Alias

`@/*` resolves to `src/*` (configured in `tsconfig.json`).

### Tests

Jest with `jest-environment-jsdom`. Tests live in `__tests__/` directories co-located with the source they test. Coverage excludes `src/app/**`, `src/middleware.ts`, `src/styles/**`, and index barrel files. Coverage threshold: 70% on all metrics.
