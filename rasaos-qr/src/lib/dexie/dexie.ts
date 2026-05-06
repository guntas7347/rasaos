import Dexie, { type Table } from "dexie";
import type { CartItemType } from "../../context/AppContext";

export interface RecentRestaurant {
  slug: string;
  id: string;
  name: string;
  image?: string;
  lastVisited: number;
}

export interface StoredOrder {
  id: string;
  createdAt: string;
  status: string;
  [key: string]: any;
}

class AppDB extends Dexie {
  recentRestaurants!: Table<RecentRestaurant>;
  orders!: Table<StoredOrder>;
  cart!: Table<CartItemType>;

  constructor() {
    super("rasaos_v2");

    this.version(1).stores({
      recentRestaurants: "slug, lastVisited",
      orders: "id, createdAt",
      cart: "id",
    });
  }
}

export const db = new AppDB();

export async function clearDB() {
  await db.delete();
}
