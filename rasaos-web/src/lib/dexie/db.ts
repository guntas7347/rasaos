import Dexie, { type Table } from "dexie";
import type { AuthCache, MenuItem, Order } from "@/types";

class AppDB extends Dexie {
  auth!: Table<AuthCache, string>;
  orders!: Table<Order, string>;
  meta!: Table<{ key: string; value: any }>;
  menu!: Table<MenuItem, string>;
  constructor() {
    super("rasaos");
    this.version(1).stores({
      auth: "key, updatedAt",
      orders:
        "id, clientOrderId, serverOrderId, syncStatus, createdAt, status, type, paymentStatus",
      meta: "key",
      menu: "id, categoryId",
    });
  }
}

export const db = new AppDB();

export async function clearDB() {
  await db.transaction("rw", db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });
}
