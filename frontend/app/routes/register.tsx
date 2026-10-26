import { Form, Link, redirect, useActionData, useNavigation } from "react-router";

import type { Route } from "./+types/register";
import { api, ApiError } from "~/lib/api";
import { inputClass, linkClass, primaryButtonClass } from "~/lib/styles";

type ActionData = {
  message: string;
  errors: Record<string, string[]>;
};

export function meta({}: Route.MetaArgs) {
  return [{ title: "Daftar · Catatan Pengeluaran" }];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  try {
    await api.post("/auth/register", {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      password_confirmation: String(formData.get("password_confirmation") ?? ""),
    });

    return redirect("/");
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message, errors: error.errors };
    }

    throw error;
  }
}

export default function Register() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const errors = actionData?.errors ?? {};
  const hasFieldErrors = Object.keys(errors).length > 0;

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Daftar</h1>

      <Form method="post" className="mt-5 space-y-4">
        {actionData?.message && !hasFieldErrors ? (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          >
            {actionData.message}
          </p>
        ) : null}

        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Nama
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={inputClass}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name?.[0] ? (
            <p id="name-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.name[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email?.[0] ? (
            <p id="email-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.email[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={inputClass}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password?.[0] ? (
            <p id="password-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.password[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password_confirmation" className="text-sm font-medium">
            Ulangi password
          </label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={inputClass}
          />
        </div>

        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? "Memproses..." : "Daftar"}
        </button>
      </Form>

      <p className="mt-5 text-sm text-slate-600 dark:text-slate-400">
        Sudah punya akun?{" "}
        <Link to="/login" className={linkClass}>
          Masuk
        </Link>
      </p>
    </>
  );
}
