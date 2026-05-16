import type { AuthRestaurant, AuthUser } from "@/contexts/AuthContext";
import type {
  OrderStatus,
  OrderType,
  PaymentStatus,
  OrderSyncStatus,
} from "./enums";
import type {
  LocalOrderItem,
  OrderAdjustment,
  LocalPayment,
  OrderPayload,
} from "./order";

export interface AuthCache {
  key: string;
  user: AuthUser | null;
  restaurant: AuthRestaurant | null;
  updatedAt: number;
}
export interface Order {
  id: string;
  clientOrderId: string;
  serverOrderId?: string | null;
  createdAt: string;
  updatedAt: string;

  // Flattened queryable properties
  status: OrderStatus;
  type: OrderType;
  subtotal: number;
  totalAmount: number;
  customerName?: string | null;
  tableNumber?: string | null;
  paymentStatus?: PaymentStatus;

  // Complex data
  items: LocalOrderItem[];
  adjustments?: OrderAdjustment[];
  pricingBreakdown?: Record<string, unknown> | null;
  payment?: LocalPayment | null;

  // Syncing
  payload: OrderPayload;
  syncStatus: OrderSyncStatus;
  syncAttempts?: number;
  lastSyncAttempt?: string;
  syncError?: string | null;
}
