import type { OrderType, PaymentStatus, PaymentProvider } from "./enums";

export interface LocalOrderItem {
  id?: string;
  itemId?: string;
  variantId?: string;
  itemName: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  lineTotal?: number;
}

export interface OrderAdjustment {
  label: string;
  type: "DISCOUNT" | "FEE" | "SURCHARGE";
  mode: "FIXED" | "PERCENTAGE";
  value: number;
}

export interface LocalPayment {
  amount: number;
  status: PaymentStatus;
  provider: PaymentProvider;
}

// The payload sent to the server
export interface OrderPayload {
  clientOrderId: string;
  type: OrderType;
  customerName?: string | null;
  customerMobile?: string | null;
  tableNumber?: string | null;
  note?: string | null;
  items: LocalOrderItem[];
  adjustments?: OrderAdjustment[];
  subtotal: number;
  totalAmount: number;
  payment?: LocalPayment | null;
}
