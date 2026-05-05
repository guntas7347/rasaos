import { API_URL } from "./env";
import toast from "react-hot-toast";

interface CallServerOptions extends RequestInit {
  data?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  status?: number;
}

export const callServer = async <T = any>(
  endpoint: string,
  options: CallServerOptions = {},
): Promise<ApiResponse<T>> => {
  const { data, headers, ...restOptions } = options;

  const config: RequestInit = {
    ...restOptions,
    credentials: "include",
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

    let result: any;
    try {
      result = await response.json();
    } catch {
      const message = "Invalid JSON response";
      toast.error(message);
      return { success: false, data: null as any, message };
    }

    if (!response.ok || (result && result.success === false)) {
      // Backend might return error in result.error or result.message
      // Only toast if status is not 404, as 404s might be expected in some places
      const message = result.error || result.message || "An error occurred";
      if (response.status !== 404) {
        toast.error(message);
      }
      return {
        success: false,
        data: null as any,
        message,
        status: response.status,
      };
    }

    // If backend is already standardized
    if (result && typeof result.success === "boolean") {
      return { ...result, status: response.status } as ApiResponse<T>;
    }

    // Wrap non-standardized responses
    return {
      success: true,
      data: result as T,
      message: "Success",
      status: response.status,
    };
  } catch (error: any) {
    const message = error.message || "Network error";
    toast.error(message);
    return { success: false, data: null as any, message };
  }
};
