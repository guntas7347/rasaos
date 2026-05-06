import { API_URL } from "./env";
import toast from "react-hot-toast";

interface CallServerOptions extends RequestInit {
  data?: any;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  status?: number;
  toastError?: boolean;
}

export const callServer = async <T = any>(
  endpoint: string,
  options: CallServerOptions = {},
  toastError = true,
): Promise<ApiResponse<T>> => {
  const {
    data,
    headers,
    timeout = 10000, // 10s default timeout
    ...restOptions
  } = options;

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  const config: RequestInit = {
    ...restOptions,
    credentials: "include",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    clearTimeout(timeoutId);

    let result: any;

    try {
      result = await response.json();
    } catch {
      const message = "Error connecting to server";

      if (toastError) {
        toast.error(message);
      }

      return {
        success: false,
        data: null as any,
        message,
      };
    }

    if (!response.ok || result?.success === false) {
      const message = result?.error || result?.message || "An error occurred";

      if (response.status !== 404 && toastError) {
        toast.error(message);
      }

      return {
        success: false,
        data: null as any,
        message,
        status: response.status,
      };
    }

    if (typeof result?.success === "boolean") {
      return {
        ...result,
        status: response.status,
      } as ApiResponse<T>;
    }

    return {
      success: true,
      data: result as T,
      message: "Success",
      status: response.status,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    const message =
      error.name === "AbortError"
        ? "Request timeout"
        : error.message || "Network error";

    if (toastError) {
      toast.error(message);
    }

    return {
      success: false,
      data: null as any,
      message,
    };
  }
};
