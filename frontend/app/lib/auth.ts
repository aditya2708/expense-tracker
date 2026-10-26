import { redirect } from "react-router";

import { api, ApiError } from "~/lib/api";
import type { User } from "~/lib/types";

export async function apiGetAsUser<T>(path: string): Promise<T> {
  try {
    return await api.get<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw redirect("/login");
    }

    throw error;
  }
}

export async function requireUser(): Promise<User> {
  const { data } = await apiGetAsUser<{ data: User }>("/auth/user");

  return data;
}
