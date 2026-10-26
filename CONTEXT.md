# Expense Tracker — Context

A personal expense tracker: log what you spend, group it by category, and review a monthly report. Built as a fullstack portfolio project — Laravel 13 API with a React Router SPA — aimed at a fullstack role. A reviewer should be able to open a live demo, log in with one click, and see a coherent product with tests and documented decisions.

## Product

- **Primary user**: an individual tracking their own spending, mostly from a phone.
- **Core flow**: register → six default categories are created → record an expense → filter the list → read the monthly report.
- **What the portfolio must show**: a clean, tested API with per-user data isolation; a usable UI; a live demo; and a README that explains the trade-offs.

## Scope (v1)

In:

- Register, login, logout.
- Per-user categories, seeded with defaults on registration; rename, create, delete (only when unused).
- Expense CRUD: amount, category, date, optional note.
- Expense list with month and category filters, paginated.
- Monthly report: total, transaction count, per-category breakdown with share, comparison against the previous month.
- Demo session that resets deterministic seed data and logs the visitor in.
- Pest feature tests for the API.

Out (deliberately):

- Budgets and targets, recurring expenses, CSV import/export, multi-currency, attachments, tags, notifications, email verification, password reset.
- End-to-end browser tests (`npm run typecheck` plus manual QA is enough for v1).

## Stack

| Layer | Choice |
| --- | --- |
| API | Laravel 13, Sanctum, Eloquent API Resources |
| Database | PostgreSQL (dev and prod); SQLite in-memory for tests |
| Frontend | React Router 8 framework mode, SPA (`ssr: false`), Vite 8, Tailwind 4, TypeScript |
| Tests | Pest 5 |
| Deploy | Single origin: Laravel serves the built SPA, host TBD (Railway or Laravel Cloud) |

## Domain

A **User** owns **Categories** and **Expenses**. An Expense belongs to exactly one Category and has an `occurred_on` date. A **Monthly report** is derived from expenses — never stored. Terms are defined in [GLOSSARY.md](./GLOSSARY.md).

## Conventions

- Money is an **integer in rupiah**, no decimals; currency is always IDR.
- Expense dates are `occurred_on` (`YYYY-MM-DD`); report months are `YYYY-MM`.
- Month boundaries use **Asia/Jakarta**, based on `occurred_on`, not `created_at`.
- API lives under `/api/v1`, returns JSON, and uses Laravel's standard 422 validation errors.
- UI is in Indonesian, mobile-first, minimal; reuse existing tokens rather than adding styles per screen.
- No new dependencies without approval.

## Decisions

- [ADR 0001](docs/adr/0001-postgres-over-sqlite.md) — PostgreSQL for dev and prod, SQLite in-memory for tests.
- [ADR 0002](docs/adr/0002-single-origin-spa-with-sanctum-cookies.md) — serve the SPA from Laravel and authenticate with Sanctum cookies.
- [ADR 0003](docs/adr/0003-react-router-spa-mode.md) — React Router in SPA mode, client loaders/actions, no TanStack Query.

## Open

- Deploy host and whether a custom domain is purchased.
- Feature work for v2 (budget per category is the strongest candidate).
- The workspace `AGENTS.md` still describes Laragon and PHP 8.2; the real environment is Herd with PHP 8.5.
