import { useEffect, useState } from "react";
import {
  Form,
  redirect,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "react-router";

import type { Route } from "./+types/categories";
import { api, ApiError } from "~/lib/api";
import { apiGetAsUser } from "~/lib/auth";
import { inputClass } from "~/lib/styles";
import type { Category } from "~/lib/types";

type ActionResult =
  | { ok: true; intent: string }
  | { ok: false; intent: string; message: string; errors: Record<string, string[]> };

export function meta({}: Route.MetaArgs) {
  return [{ title: "Kategori · Catatan Pengeluaran" }];
}

export async function clientLoader() {
  const { data } = await apiGetAsUser<{ data: Category[] }>("/categories");

  return { categories: data };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");
  const id = Number(formData.get("id"));

  try {
    if (intent === "create") {
      await api.post("/categories", { name: String(formData.get("name") ?? "") });
    } else if (intent === "rename" && Number.isInteger(id) && id > 0) {
      await api.patch(`/categories/${id}`, { name: String(formData.get("name") ?? "") });
    } else if (intent === "delete" && Number.isInteger(id) && id > 0) {
      await api.delete(`/categories/${id}`);
    } else {
      return {
        ok: false,
        intent,
        message: "Aksi kategori tidak dikenal.",
        errors: {},
      } satisfies ActionResult;
    }

    return { ok: true, intent } satisfies ActionResult;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw redirect("/login");
    }

    if (error instanceof ApiError) {
      return {
        ok: false,
        intent,
        message: error.message,
        errors: error.errors,
      } satisfies ActionResult;
    }

    throw error;
  }
}

export default function Categories() {
  const { categories } = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<ActionResult>();
  const navigation = useNavigation();
  const [name, setName] = useState("");

  const isCreating =
    navigation.state === "submitting" && navigation.formData?.get("intent") === "create";
  const createError = actionData?.ok === false && actionData.intent === "create" ? actionData : null;

  useEffect(() => {
    if (actionData?.ok && actionData.intent === "create") {
      setName("");
    }
  }, [actionData]);

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Kategori</h1>

      <Form method="post" className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <input type="hidden" name="intent" value="create" />
        <div className="flex-1">
          <label htmlFor="new-category" className="sr-only">
            Nama kategori
          </label>
          <input
            id="new-category"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={50}
            required
            placeholder="Nama kategori"
            className={inputClass}
            aria-invalid={createError?.errors.name ? true : undefined}
            aria-describedby={createError?.errors.name ? "new-category-error" : undefined}
          />
          {createError?.errors.name?.[0] ? (
            <p id="new-category-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {createError.errors.name[0]}
            </p>
          ) : createError ? (
            <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {createError.message}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:self-start"
        >
          {isCreating ? "Menyimpan..." : "Tambah"}
        </button>
      </Form>

      {categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Belum ada kategori.
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {categories.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </ul>
      )}
    </section>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const fetcher = useFetcher<ActionResult>();
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [name, setName] = useState(category.name);

  const isBusy = fetcher.state !== "idle";
  const rowError = fetcher.data && fetcher.data.ok === false ? fetcher.data : null;

  useEffect(() => {
    if (fetcher.data?.ok && fetcher.data.intent === "rename") {
      setIsEditing(false);
    }
  }, [fetcher.data]);

  const startEditing = () => {
    setName(category.name);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setName(category.name);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li className="px-4 py-3">
        <fetcher.Form method="post" className="space-y-2">
          <input type="hidden" name="intent" value="rename" />
          <input type="hidden" name="id" value={category.id} />
          <label htmlFor={`category-${category.id}`} className="sr-only">
            Nama kategori
          </label>
          <input
            id={`category-${category.id}`}
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={50}
            required
            autoFocus
            className={inputClass}
            aria-invalid={rowError?.errors.name ? true : undefined}
          />
          {rowError?.intent === "rename" && rowError.errors.name?.[0] ? (
            <p className="text-xs text-red-600 dark:text-red-400">{rowError.errors.name[0]}</p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isBusy}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {isBusy ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
          </div>
        </fetcher.Form>
      </li>
    );
  }

  return (
    <li className="px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-medium">{category.name}</span>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={startEditing}
            className="rounded-lg px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Ubah
          </button>

          {isConfirmingDelete ? (
            <>
              <fetcher.Form method="post">
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={category.id} />
                <button
                  type="submit"
                  disabled={isBusy}
                  className="rounded-lg px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  {isBusy ? "Menghapus..." : "Ya, hapus"}
                </button>
              </fetcher.Form>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="rounded-lg px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Batal
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="rounded-lg px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hapus
            </button>
          )}
        </div>
      </div>

      {rowError?.intent === "delete" ? (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
          {rowError.message}
        </p>
      ) : null}
    </li>
  );
}
