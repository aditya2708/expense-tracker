import { Link, useLoaderData } from "react-router";

import type { Route } from "./+types/dashboard";
import { CategoryBreakdown } from "~/components/category-breakdown";
import { ExpenseList } from "~/components/expense-list";
import { MonthlySummary } from "~/components/monthly-summary";
import { apiGetAsUser } from "~/lib/auth";
import { todayInJakarta } from "~/lib/format";
import { linkClass } from "~/lib/styles";
import type { Expense, MonthlyReport, Paginated } from "~/lib/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard · Catatan Pengeluaran" }];
}

export async function clientLoader() {
  const month = todayInJakarta().slice(0, 7);

  const [report, expenses] = await Promise.all([
    apiGetAsUser<{ data: MonthlyReport }>(`/reports/monthly?month=${month}`),
    apiGetAsUser<Paginated<Expense>>(`/expenses?month=${month}`),
  ]);

  return {
    month,
    report: report.data,
    recent: expenses.data.slice(0, 5),
  };
}

export default function Dashboard() {
  const { month, report, recent } = useLoaderData<typeof clientLoader>();
  const reportHref = `/reports?month=${month}`;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <Link
          to="/expenses/new"
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          Catat
        </Link>
      </div>

      <MonthlySummary month={month} report={report} reportHref={reportHref} />

      {report.categories.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Kategori teratas</h2>
            <Link
              to={reportHref}
              className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
            >
              Semua
            </Link>
          </div>
          <div className="mt-3">
            <CategoryBreakdown categories={report.categories.slice(0, 3)} />
          </div>
        </section>
      ) : null}

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Terbaru</h2>
          <Link
            to={`/expenses?month=${month}`}
            className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Semua
          </Link>
        </div>

        {recent.length > 0 ? (
          <ExpenseList expenses={recent} />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Belum ada pengeluaran bulan ini.
            </p>
            <Link to="/expenses/new" className={`mt-2 inline-block text-sm ${linkClass}`}>
              Catat pengeluaran
            </Link>
          </div>
        )}
      </section>
    </section>
  );
}
