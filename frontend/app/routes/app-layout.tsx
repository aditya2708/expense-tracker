import { Form, NavLink, Outlet, useLoaderData, useNavigation } from "react-router";

import { requireUser } from "~/lib/auth";

export async function clientLoader() {
  return { user: await requireUser() };
}

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/expenses", label: "Pengeluaran" },
  { to: "/categories", label: "Kategori" },
  { to: "/reports", label: "Laporan" },
];

export default function AppLayout() {
  const { user } = useLoaderData<typeof clientLoader>();
  const navigation = useNavigation();
  const isLoggingOut = navigation.state !== "idle" && navigation.formAction === "/logout";

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <NavLink
            to="/"
            className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100"
          >
            Catatan Pengeluaran
          </NavLink>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-40 truncate text-sm text-slate-500 sm:block dark:text-slate-400">
              {user.name}
            </span>
            <Form method="post" action="/logout">
              <button
                type="submit"
                disabled={isLoggingOut}
                className="rounded-lg px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {isLoggingOut ? "Keluar..." : "Keluar"}
              </button>
            </Form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-3xl flex-wrap gap-0.5 px-4 pb-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-2.5 py-2 text-[13px] font-medium transition sm:text-sm ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
