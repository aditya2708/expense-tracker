import { formatRupiah, formatShare } from "~/lib/format";
import type { ReportCategory } from "~/lib/types";

export function CategoryBreakdown({ categories }: { categories: ReportCategory[] }) {
  return (
    <ul className="space-y-3">
      {categories.map((category) => (
        <li key={category.id}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium">{category.name}</span>
            <span className="shrink-0 tabular-nums">{formatRupiah(category.total)}</span>
          </div>

          <div
            className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${Math.min(100, category.share)}%` }}
            />
          </div>

          <div className="mt-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{category.count} transaksi</span>
            <span>{formatShare(category.share)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
