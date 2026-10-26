import { Form, Link, redirect, useActionData, useNavigation } from "react-router";

import type { Route } from "./+types/login";
import { api, ApiError } from "~/lib/api";
import { inputClass, linkClass, primaryButtonClass } from "~/lib/styles";

type ActionData = {
  intent: string;
  message: string;
  errors: Record<string, string[]>;
};

export function meta({}: Route.MetaArgs) {
  return [{ title: "Masuk · Catatan Pengeluaran" }];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "login");

  try {
    if (intent === "demo") {
      await api.post("/demo-session");
    } else {
      await api.post("/auth/login", {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
    }

    return redirect("/");
  } catch (error) {
    if (error instanceof ApiError) {
      return { intent, message: error.message, errors: error.errors };
    }

    throw error;
  }
}

export default function Login() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isBusy = navigation.state === "submitting";
  const isLoggingIn = isBusy && navigation.formData?.get("intent") === "login";
  const isDemoSubmitting = isBusy && navigation.formData?.get("intent") === "demo";
  const loginError = actionData?.intent === "login" ? actionData : null;
  const demoError = actionData?.intent === "demo" ? actionData : null;
  const errors = loginError?.errors ?? {};
  const hasFieldErrors = Object.keys(errors).length > 0;

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Masuk</h1>

      <Form method="post" className="mt-5 space-y-4">
        <input type="hidden" name="intent" value="login" />

        {loginError?.message && !hasFieldErrors ? (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          >
            {loginError.message}
          </p>
        ) : null}

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
            autoComplete="current-password"
            required
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

        <button type="submit" disabled={isBusy} className={primaryButtonClass}>
          {isLoggingIn ? "Memproses..." : "Masuk"}
        </button>
      </Form>

      <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
        <Form method="post">
          <input type="hidden" name="intent" value="demo" />
          <button
            type="submit"
            disabled={isBusy}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {isDemoSubmitting ? "Menyiapkan demo..." : "Coba demo"}
          </button>
        </Form>
        {demoError ? (
          <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
            {demoError.message}
          </p>
        ) : null}
      </div>

      <p className="mt-5 text-sm text-slate-600 dark:text-slate-400">
        Belum punya akun?{" "}
        <Link to="/register" className={linkClass}>
          Daftar
        </Link>
      </p>
    </>
  );
}
