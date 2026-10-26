import type { ExpensePayload } from "~/lib/types";

export type ExpenseActionResult = {
  intent: string;
  message: string;
  errors: Record<string, string[]>;
};

export function expensePayloadFromForm(formData: FormData): ExpensePayload {
  const note = String(formData.get("note") ?? "").trim();

  return {
    category_id: Number(formData.get("category_id")),
    amount: Number(formData.get("amount")),
    occurred_on: String(formData.get("occurred_on") ?? ""),
    note: note === "" ? null : note,
  };
}
