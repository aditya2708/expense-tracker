# React Router in SPA mode

The app is an authenticated dashboard with no public pages that need indexing, so React Router runs with `ssr: false`. Pages fetch through `clientLoader`/`clientAction` and `fetcher`, with a small typed `fetch` wrapper that sends credentials and the CSRF token. We do not add TanStack Query: React Router's data APIs already cover revalidation, pending states, and mutations, and adding a second cache would duplicate them.

## Consequences

- No server rendering; first paint waits for the JS bundle and client-side data loading. Acceptable for a dashboard behind a login.
- OAuth-style redirects and cookie handling stay in the browser, avoiding server-side cookie forwarding.
- If public, SEO-relevant pages are added later, this decision must be revisited; the data layer would move from `clientLoader` to `loader`.
