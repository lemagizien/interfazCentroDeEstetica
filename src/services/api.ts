
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiOptions extends RequestInit {
  token?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, headers, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const contentType = response.headers.get("content-type");

  const data: unknown = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    let message = "Ocurrió un error al comunicarse con el servidor.";

    if (data && typeof data === "object") {
      const errorData = data as {
        mensaje?: string;
        message?: string;
        error?: string;
      };

      message =
        errorData.mensaje ||
        errorData.message ||
        errorData.error ||
        message;
    }

    throw new ApiError(response.status, message);
  }

  return data as T;
}
