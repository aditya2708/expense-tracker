import { Link } from "react-router";

import { formatChange, formatMonth, formatRupiah } from "~/lib/format";
import type { MonthlyReport } from "~/lib/types";

type MonthlySummaryProps = {
  month: string;
  report: MonthlyReport;
  reportHref?: string;
};

export function MonthlySummary({ month, report, reportHref }: MonthlySummaryProps) {
  const change = report.change_percentage;
  const hasPrevious = report.previous_month.total > 0;

  const tone =
    !hasPrevious || change === null || change === 0
      ? "text-slate-500 dark:text-slate-400"
      : change > 0
        ? "text-red-600 dark:text-red-400"
        : "text-emerald-600 dark:text-emerald-400";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pengeluaran {formatMonth(month)}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatRupiah(report.total)}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {report.expense_count} transaksi
          </p>
        </div>

        {reportHref ? (
          <Link
            to={reportHref}
            className="shrink-0 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Lihat laporan
          </Link>
        ) : null}
      </div>

      <p className={`mt-3 text-xs ${tone}`}>
        {hasPrevious
          ? `${formatChange(change ?? 0)} dari ${formatMonth(report.previous_month.month)} (${formatRupiah(report.previous_month.total)})`
          : "Tidak ada pengeluaran bulan lalu."}
      </p>
    </section>
  );
}
