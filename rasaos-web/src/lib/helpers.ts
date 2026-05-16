import toast from "react-hot-toast";
import { clearDB } from "@/lib/dexie/db";
import { API_URL } from "@/lib/env";

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

      if (response.status === 401) {
        await clearDB();
        if (window.location.pathname !== "/login") {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
        }
      }

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

// [
//   {
//     name: "Starters",
//     order: 1,
//     imageUrl: "",
//     items: [
//       {
//         name: "Paneer Tikka",
//         description: "Cottage cheese cubes marinated with spices and grilled.",
//         imageUrl: "",
//         variants: [
//           {
//             name: "Regular",
//             price: 24900,
//           },
//         ],
//       },
//       {
//         name: "Chicken Wings",
//         description: "Spicy crispy chicken wings served with dip.",
//         imageUrl: "",
//         variants: [
//           {
//             name: "6 Pieces",
//             price: 29900,
//           },
//           {
//             name: "12 Pieces",
//             price: 54900,
//           },
//         ],
//       },
//     ],
//   },
//   {
//     name: "Main Course",
//     order: 2,
//     imageUrl: "",
//     items: [
//       {
//         name: "Butter Chicken",
//         description: "Creamy tomato-based chicken curry.",
//         imageUrl: "",
//         variants: [
//           {
//             name: "Half",
//             price: 34900,
//           },
//           {
//             name: "Full",
//             price: 64900,
//           },
//         ],
//       },
//       {
//         name: "Veg Biryani",
//         description: "Fragrant basmati rice cooked with vegetables and spices.",
//         imageUrl: "",
//         variants: [
//           {
//             name: "Regular",
//             price: 27900,
//           },
//         ],
//       },
//     ],
//   },
//   {
//     name: "Beverages",
//     order: 3,
//     imageUrl: "",
//     items: [
//       {
//         name: "Cold Coffee",
//         description: "Chilled creamy coffee served with ice cream.",
//         imageUrl: "",
//         variants: [
//           {
//             name: "Regular",
//             price: 14900,
//           },
//         ],
//       },
//       {
//         name: "Fresh Lime Soda",
//         description: "Refreshing lime soda sweet or salted.",
//         imageUrl: "",
//         variants: [
//           {
//             name: "Regular",
//             price: 9900,
//           },
//         ],
//       },
//     ],
//   },
//   {
//     name: "Desserts",
//     order: 4,
//     imageUrl: "",
//     items: [
//       {
//         name: "Gulab Jamun",
//         description: "Soft milk dumplings soaked in sugar syrup.",
//         imageUrl: "",
//         variants: [
//           {
//             name: "2 Pieces",
//             price: 8900,
//           },
//         ],
//       },
//       {
//         name: "Chocolate Brownie",
//         description: "Warm chocolate brownie served with vanilla ice cream.",
//         imageUrl: "",
//         variants: [
//           {
//             name: "Regular",
//             price: 19900,
//           },
//         ],
//       },
//     ],
//   },
// ];
