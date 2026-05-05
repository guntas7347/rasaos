import Dexie, { type Table } from "dexie";

export interface AuthCache {
  key: string;
  user: any;
  restaurant: any;
  menu: any;
  updatedAt: number;
}

export interface Order {
  id: string;
  client_id?: string;
  server_id?: string;
  createdAt: string;
  status: string;
  type?: string;
  [key: string]: any;
}

class AppDB extends Dexie {
  auth!: Table<AuthCache>;
  orders!: Table<Order>;

  constructor() {
    super("rasaos");

    this.version(1).stores({
      auth: "key, updatedAt",
      orders: "client_id, server_id, createdAt, status, type",
      meta: "key",
    });
  }
}

export const db = new AppDB();

export async function clearDB() {
  await db.delete();
}
