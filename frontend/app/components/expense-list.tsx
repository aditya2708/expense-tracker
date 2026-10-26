import { Link } from "react-router";

import { formatDate, formatRupiah } from "~/lib/format";
import type { Expense } from "~/lib/types";

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  return (
    <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
      {expenses.map((expense) => (
        <li key={expense.id}>
          <Link
            to={`/expenses/${expense.id}/edit`}
            className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{expense.category.name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {formatDate(expense.occurred_on)}
                {expense.note ? ` · ${expense.note}` : ""}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {formatRupiah(expense.amount)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
