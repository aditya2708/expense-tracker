# PostgreSQL for development and production

Laravel 13 defaults to SQLite, and the scaffold could have stayed there. We keep PostgreSQL: the local server is already running with the migrations applied, PostgreSQL appears frequently in job listings we are targeting, and using one engine in dev and prod removes a class of deployment surprises. SQLite remains only as the in-memory database for tests, which keeps the suite fast.

## Considered Options

- **SQLite everywhere** — zero setup, single-file deploy. Rejected: it would discard a working local setup, and a portfolio piece benefits from matching production.
- **MySQL** — a server is installed locally. Rejected: no advantage over the already-working PostgreSQL.

## Consequences

- Local Postgres must be running before the app or API can be used.
- Tests run on SQLite, so avoid PostgreSQL-only SQL; stick to Eloquent and the query builder so tests stay representative.
- Production needs a managed PostgreSQL instance, which is available on the likely hosts.
