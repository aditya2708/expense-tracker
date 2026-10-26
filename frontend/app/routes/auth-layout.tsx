import { Link, Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="mb-4 inline-block text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100"
        >
          Catatan Pengeluaran
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
