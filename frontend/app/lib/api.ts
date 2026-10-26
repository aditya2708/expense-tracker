const API_PREFIX = "/api/v1";
const CONNECTION_ERROR = "Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.";

export class ApiError extends Error {
  readonly status: number;
  readonly errors: Record<string, string[]>;

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

function friendlyMessage(status: number, fallback?: string): string {
  if (status === 0) {
    return CONNECTION_ERROR;
  }

  if (status === 419) {
    return "Sesi formulir kedaluwarsa. Muat ulang halaman lalu coba lagi.";
  }

  if (status === 429) {
    return "Terlalu banyak percobaan. Coba lagi sebentar.";
  }

  if (status >= 500) {
    return "Terjadi kesalahan pada server. Coba lagi.";
  }

  return fallback ?? "Permintaan gagal. Coba lagi.";
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

function readCookie(name: string): string | null {
  const prefix = `${name}=`;

  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(prefix)) {
      const value = part.slice(prefix.length);

      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }

  return null;
}

async function csrfToken(): Promise<string | null> {
  const token = readCookie("XSRF-TOKEN");

  if (token) {
    return token;
  }

  await fetch("/sanctum/csrf-cookie", {
    credentials: "include",
    headers: { Accept: "application/json" },
  }).catch(() => {
    throw new ApiError(0, CONNECTION_ERROR);
  });

  return readCookie("XSRF-TOKEN");
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined;

  headers.set("Accept", "application/json");

  if (hasBody) {
    headers.set("Content-Type", "application/json");
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const token = await csrfToken();

    if (token) {
      headers.set("X-XSRF-TOKEN", token);
    }
  }

  const response = await fetch(`${API_PREFIX}${path}`, {
    ...options,
    method,
    headers,
    credentials: "include",
    body: hasBody ? JSON.stringify(options.body) : undefined,
  }).catch(() => {
    throw new ApiError(0, CONNECTION_ERROR);
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => null)) as {
    message?: string;
    errors?: Record<string, string[]>;
  } | null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      friendlyMessage(response.status, payload?.message),
      payload?.errors ?? {},
    );
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PATCH", body }),
  delete: (path: string) => apiRequest<void>(path, { method: "DELETE" }),
};
