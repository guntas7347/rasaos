import Dexie, { type Table } from "dexie";

export interface AuthCache {
  key: string;
  user: any;
  restaurant: any;
  menu: any;
  updatedAt: number;
}

export type OrderSyncStatus = "LOCAL_ONLY" | "SYNCING" | "SYNCED" | "FAILED";

export interface OrderPayloadItem {
  itemId?: string;
  variantId?: string;

  itemName: string;
  variantName?: string;

  // integer paise/cents only
  unitPrice: number;

  quantity: number;
}

export interface OrderAdjustment {
  label: string;

  type: "DISCOUNT" | "FEE" | "SURCHARGE";

  mode: "FIXED" | "PERCENTAGE";

  // integer paise/cents for FIXED
  value: number;
}

export interface OrderPayload {
  clientOrderId: string;

  type?: string;

  customerName?: string;
  customerMobile?: string;
  tableNumber?: string;
  note?: string;

  items: OrderPayloadItem[];

  adjustments?: OrderAdjustment[];
}

export interface Order {
  // local dexie id
  id: string;

  // stable sync identity
  clientOrderId: string;

  // postgres/server order id
  serverOrderId?: string;

  createdAt: string;

  updatedAt?: string;

  status: string;

  type?: string;

  syncStatus: OrderSyncStatus;

  syncAttempts?: number;

  lastSyncAttempt?: string;

  syncError?: string | null;

  payload: OrderPayload;
  items?: any[];
  subtotal?: number;
  totalAmount?: number;
  customerName?: string;
  tableNumber?: string;
  pricingBreakdown?: any;
  payment?: any;
}

class AppDB extends Dexie {
  auth!: Table<AuthCache>;
  orders!: Table<Order>;

  constructor() {
    super("rasaos");

    this.version(1).stores({
      auth: "key, updatedAt",
      orders:
        "id, clientOrderId, serverOrderId, syncStatus, createdAt, status, type",
      meta: "key",
    });
  }
}

export const db = new AppDB();

export async function clearDB() {
  await db.transaction("rw", db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });
}

// const destroyDB = async () => {
//   await db.delete();
//   window.location.reload();
// };

// destroyDB();
