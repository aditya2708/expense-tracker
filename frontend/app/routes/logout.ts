import { redirect } from "react-router";

import { api, ApiError } from "~/lib/api";

export async function clientAction() {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 401)) {
      throw error;
    }
  }

  return redirect("/login");
}
