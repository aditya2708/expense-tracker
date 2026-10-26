import { useState } from "react";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";

import type { Route } from "./+types/expense-edit";
import { ExpenseForm } from "~/components/expense-form";
import { api, ApiError } from "~/lib/api";
import { apiGetAsUser } from "~/lib/auth";
import { expensePayloadFromForm, type ExpenseActionResult } from "~/lib/expenses";
import type { Category, Expense } from "~/lib/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Ubah pengeluaran · Catatan Pengeluaran" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const expenseId = Number(params.expenseId);

  if (!Number.isInteger(expenseId) || expenseId <= 0) {
    throw new Response("Pengeluaran tidak ditemukan.", { status: 404 });
  }

  try {
    const [categories, expense] = await Promise.all([
      apiGetAsUser<{ data: Category[] }>("/categories"),
      apiGetAsUser<{ data: Expense }>(`/expenses/${expenseId}`),
    ]);

    return { categories: categories.data, expense: expense.data };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
      throw new Response("Pengeluaran tidak ditemukan.", { status: 404 });
    }

    throw error;
  }
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "save");
  const expenseId = Number(params.expenseId);

  try {
    if (intent === "delete") {
      await api.delete(`/expenses/${expenseId}`);
    } else {
      await api.patch(`/expenses/${expenseId}`, expensePayloadFromForm(formData));
    }

    return redirect("/expenses");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw redirect("/login");
    }

    if (error instanceof ApiError) {
      if (error.status === 403 || error.status === 404) {
        return {
          intent,
          message: "Pengeluaran tidak ditemukan atau bukan milikmu.",
          errors: {},
        } satisfies ExpenseActionResult;
      }

      return {
        intent,
        message: error.message,
        errors: error.errors,
      } satisfies ExpenseActionResult;
    }

    throw error;
  }
}

export default function EditExpense() {
  const { categories, expense } = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<ExpenseActionResult>();
  const navigation = useNavigation();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isSaving =
    navigation.state === "submitting" && navigation.formData?.get("intent") === "save";
  const isDeleting =
    navigation.state === "submitting" && navigation.formData?.get("intent") === "delete";

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Ubah pengeluaran</h1>

      <ExpenseForm
        categories={categories}
        expense={expense}
        actionData={actionData?.intent === "save" ? actionData : undefined}
        isSubmitting={isSaving}
        submitLabel="Simpan perubahan"
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {isConfirmingDelete ? (
          <Form method="post" className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="intent" value="delete" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Hapus pengeluaran ini?
            </span>
            <button
              type="submit"
              disabled={isDeleting}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              {isDeleting ? "Menghapus..." : "Ya, hapus"}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
          </Form>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Hapus pengeluaran
          </button>
        )}

        {actionData?.intent === "delete" ? (
          <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
            {actionData.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
