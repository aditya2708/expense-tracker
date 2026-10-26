import { Form, Link, useLoaderData } from "react-router";

import type { Route } from "./+types/reports";
import { CategoryBreakdown } from "~/components/category-breakdown";
import { MonthlySummary } from "~/components/monthly-summary";
import { apiGetAsUser } from "~/lib/auth";
import { formatMonth, todayInJakarta } from "~/lib/format";
import { inputClass, linkClass } from "~/lib/styles";
import type { MonthlyReport } from "~/lib/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Laporan · Catatan Pengeluaran" }];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const month = url.searchParams.get("month") || todayInJakarta().slice(0, 7);

  const { data } = await apiGetAsUser<{ data: MonthlyReport }>(
    `/reports/monthly?month=${encodeURIComponent(month)}`,
  );

  return { month, report: data };
}

export default function Reports() {
  const { month, report } = useLoaderData<typeof clientLoader>();

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Laporan</h1>

        <Form method="get" className="w-full sm:w-48">
          <label htmlFor="month" className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Bulan
          </label>
          <input
            id="month"
            name="month"
            type="month"
            defaultValue={month}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
            className={inputClass}
          />
        </Form>
      </div>

      <MonthlySummary month={month} report={report} />

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold">Per kategori</h2>

        {report.categories.length > 0 ? (
          <div className="mt-3">
            <CategoryBreakdown categories={report.categories} />
          </div>
        ) : (
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            <p>Belum ada pengeluaran pada {formatMonth(month)}.</p>
            <Link to="/expenses/new" className={`mt-2 inline-block text-sm ${linkClass}`}>
              Catat pengeluaran
            </Link>
          </div>
        )}
      </section>
    </section>
  );
}
