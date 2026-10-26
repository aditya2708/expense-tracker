# Serve the SPA from Laravel and authenticate with Sanctum cookies

The SPA and the API are separate codebases but ship as one origin: the React Router build is served by Laravel, and the API lives under `/api/v1` on the same host. Authentication uses Sanctum's stateful cookie flow (HTTP-only session cookie plus CSRF token), so no access token is exposed to JavaScript. During development, Vite proxies `/api` and `/sanctum` to Laravel, which keeps cookies first-party there too.

## Considered Options

- **Separate origins with cookie auth** — Vercel frontend plus Railway API on unrelated domains. Rejected: browsers block third-party cookies, so the session cookie would not be sent.
- **The same setup with a custom domain** (`app.` and `api.` subdomains) — workable and the most production-like, but requires buying and configuring a domain.
- **Bearer tokens stored in `sessionStorage`** — works across origins without a domain. Rejected: tokens become readable by any XSS, and reviewers read it as a shortcut.

## Consequences

- One deployable artifact; frontend and backend releases are coupled.
- A catch-all route serves the SPA shell and must not shadow `/api`, `/sanctum`, or storage routes.
- No CDN separation for static assets in v1.
- Switching to a split deployment later means revisiting auth, not just hosting.
