import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const meta: Route.MetaFunction = () => [
  { title: "Catatan Pengeluaran" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Terjadi kesalahan";
  let details = "Coba muat ulang halaman.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    const data = typeof error.data === "string" ? error.data : null;

    if (error.status === 404) {
      title = "Halaman tidak ditemukan";
      details = data ?? "Tautan yang kamu buka tidak tersedia.";
    } else {
      title = `Error ${error.status}`;
      details = data ?? (error.statusText || details);
    }
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 px-4">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">{details}</p>
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          Kembali
        </Link>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-sm font-medium text-slate-600 hover:underline dark:text-slate-300"
        >
          Muat ulang
        </button>
      </div>
      {stack ? (
        <pre className="w-full overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-900">
          <code>{stack}</code>
        </pre>
      ) : null}
    </main>
  );
}
