export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export type OrderStatus = "PENDING" | "PREPARING" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentProvider = "CASH" | "CARD" | "UPI" | "STRIPE";
export type OrderSyncStatus = "LOCAL_ONLY" | "SYNCING" | "SYNCED" | "FAILED";
