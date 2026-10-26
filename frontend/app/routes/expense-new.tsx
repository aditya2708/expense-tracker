import { redirect, useActionData, useLoaderData, useNavigation } from "react-router";

import type { Route } from "./+types/expense-new";
import { ExpenseForm } from "~/components/expense-form";
import { api, ApiError } from "~/lib/api";
import { apiGetAsUser } from "~/lib/auth";
import { expensePayloadFromForm, type ExpenseActionResult } from "~/lib/expenses";
import type { Category } from "~/lib/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Catat pengeluaran · Catatan Pengeluaran" }];
}

export async function clientLoader() {
  const { data } = await apiGetAsUser<{ data: Category[] }>("/categories");

  return { categories: data };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  try {
    await api.post("/expenses", expensePayloadFromForm(formData));

    return redirect("/expenses");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw redirect("/login");
    }

    if (error instanceof ApiError) {
      return {
        intent: "save",
        message: error.message,
        errors: error.errors,
      } satisfies ExpenseActionResult;
    }

    throw error;
  }
}

export default function NewExpense() {
  const { categories } = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<ExpenseActionResult>();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === "submitting" && navigation.formData?.get("intent") === "save";

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Catat pengeluaran</h1>
      <ExpenseForm
        categories={categories}
        actionData={actionData}
        isSubmitting={isSubmitting}
        submitLabel="Simpan"
      />
    </section>
  );
}
