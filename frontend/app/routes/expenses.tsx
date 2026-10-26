import { Form, Link, useLoaderData, useSearchParams } from "react-router";

import type { Route } from "./+types/expenses";
import { ExpenseList } from "~/components/expense-list";
import { apiGetAsUser } from "~/lib/auth";
import { inputClass, linkClass } from "~/lib/styles";
import type { Category, Expense, Paginated } from "~/lib/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Pengeluaran · Catatan Pengeluaran" }];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const month = url.searchParams.get("month") ?? "";
  const categoryId = url.searchParams.get("category_id") ?? "";
  const page = url.searchParams.get("page") ?? "1";

  const params = new URLSearchParams();

  if (month) {
    params.set("month", month);
  }

  if (categoryId) {
    params.set("category_id", categoryId);
  }

  if (page !== "1") {
    params.set("page", page);
  }

  const query = params.toString();

  const [expenses, categories] = await Promise.all([
    apiGetAsUser<Paginated<Expense>>(`/expenses${query ? `?${query}` : ""}`),
    apiGetAsUser<{ data: Category[] }>("/categories"),
  ]);

  return {
    expenses: expenses.data,
    meta: expenses.meta,
    categories: categories.data,
    filters: { month, categoryId },
  };
}

export default function Expenses() {
  const { expenses, meta, categories, filters } = useLoaderData<typeof clientLoader>();
  const [searchParams] = useSearchParams();
  const hasFilters = Boolean(filters.month || filters.categoryId);

  const pageHref = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));

    return `?${next.toString()}`;
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Pengeluaran</h1>
        <Link
          to="/expenses/new"
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          Catat
        </Link>
      </div>

      <Form method="get" className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="month" className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Bulan
          </label>
          <input
            id="month"
            name="month"
            type="month"
            defaultValue={filters.month}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
            className={inputClass}
          />
        </div>

        <div className="flex-1">
          <label
            htmlFor="category"
            className="text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            Kategori
          </label>
          <select
            id="category"
            name="category_id"
            defaultValue={filters.categoryId}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
            className={inputClass}
          >
            <option value="">Semua kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {hasFilters ? (
          <Link
            to="/expenses"
            className="pb-2 text-sm font-medium text-slate-600 hover:underline dark:text-slate-300"
          >
            Reset
          </Link>
        ) : null}
      </Form>

      {expenses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {hasFilters ? "Tidak ada pengeluaran pada filter ini." : "Belum ada pengeluaran."}
          </p>
          <Link
            to={hasFilters ? "/expenses" : "/expenses/new"}
            className={`mt-2 inline-block text-sm ${linkClass}`}
          >
            {hasFilters ? "Reset filter" : "Catat pengeluaran"}
          </Link>
        </div>
      ) : (
        <ExpenseList expenses={expenses} />
      )}

      {meta.last_page > 1 ? (
        <nav
          aria-label="Paginasi"
          className="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400"
        >
          {meta.current_page > 1 ? (
            <Link
              to={pageHref(meta.current_page - 1)}
              className="rounded-lg px-2 py-1 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Sebelumnya
            </Link>
          ) : (
            <span className="rounded-lg px-2 py-1 opacity-40">Sebelumnya</span>
          )}

          <span>
            Halaman {meta.current_page} dari {meta.last_page}
          </span>

          {meta.current_page < meta.last_page ? (
            <Link
              to={pageHref(meta.current_page + 1)}
              className="rounded-lg px-2 py-1 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Berikutnya
            </Link>
          ) : (
            <span className="rounded-lg px-2 py-1 opacity-40">Berikutnya</span>
          )}
        </nav>
      ) : null}
    </section>
  );
}
