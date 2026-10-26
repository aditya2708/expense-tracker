import { Form, Link } from "react-router";

import type { ExpenseActionResult } from "~/lib/expenses";
import { todayInJakarta } from "~/lib/format";
import { inputClass, linkClass } from "~/lib/styles";
import type { Category, Expense } from "~/lib/types";

type ExpenseFormProps = {
  categories: Category[];
  expense?: Expense;
  actionData?: ExpenseActionResult;
  isSubmitting: boolean;
  submitLabel: string;
};

export function ExpenseForm({
  categories,
  expense,
  actionData,
  isSubmitting,
  submitLabel,
}: ExpenseFormProps) {
  if (categories.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
        Belum ada kategori.{" "}
        <Link to="/categories" className={linkClass}>
          Tambah kategori
        </Link>{" "}
        dulu.
      </p>
    );
  }

  const errors = actionData?.errors ?? {};
  const generalError =
    actionData?.message && Object.keys(errors).length === 0 ? actionData.message : null;

  return (
    <Form
      method="post"
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <input type="hidden" name="intent" value="save" />

      {generalError ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
        >
          {generalError}
        </p>
      ) : null}

      <div>
        <label htmlFor="amount" className="text-sm font-medium">
          Jumlah (Rp)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          required
          defaultValue={expense?.amount}
          className={`${inputClass} tabular-nums`}
          aria-invalid={errors.amount ? true : undefined}
          aria-describedby={errors.amount ? "amount-error" : undefined}
        />
        {errors.amount?.[0] ? (
          <p id="amount-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.amount[0]}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="occurred_on" className="text-sm font-medium">
          Tanggal
        </label>
        <input
          id="occurred_on"
          name="occurred_on"
          type="date"
          required
          defaultValue={expense?.occurred_on ?? todayInJakarta()}
          className={inputClass}
          aria-invalid={errors.occurred_on ? true : undefined}
          aria-describedby={errors.occurred_on ? "occurred-on-error" : undefined}
        />
        {errors.occurred_on?.[0] ? (
          <p id="occurred-on-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.occurred_on[0]}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="category_id" className="text-sm font-medium">
          Kategori
        </label>
        <select
          id="category_id"
          name="category_id"
          required
          defaultValue={expense?.category.id ?? categories[0]?.id}
          className={inputClass}
          aria-invalid={errors.category_id ? true : undefined}
          aria-describedby={errors.category_id ? "category-error" : undefined}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category_id?.[0] ? (
          <p id="category-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.category_id[0]}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="note" className="text-sm font-medium">
          Catatan <span className="font-normal text-slate-400">(opsional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={500}
          defaultValue={expense?.note ?? ""}
          className={inputClass}
          aria-invalid={errors.note ? true : undefined}
          aria-describedby={errors.note ? "note-error" : undefined}
        />
        {errors.note?.[0] ? (
          <p id="note-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.note[0]}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </button>
        <Link
          to="/expenses"
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Batal
        </Link>
      </div>
    </Form>
  );
}
