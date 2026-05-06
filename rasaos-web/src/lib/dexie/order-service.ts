import { db, type Order } from "./dexie";
import { v4 as uuid } from "uuid";

export const OrderService = {
  /**
   * Saves a new order locally
   */
  async saveNewOrder(payload: any) {
    const now = new Date().toISOString();

    // Calculate basic totals for the local UI display
    const subtotal = payload.items.reduce(
      (acc: number, item: any) => acc + item.unitPrice * item.quantity,
      0,
    );
    // Note: Add logic here if you want local adjustments calculated immediately
    const totalAmount = subtotal;

    const order: Order = {
      id: uuid(), // Temporary local ID
      clientOrderId: payload.clientOrderId || uuid(),
      createdAt: now,
      updatedAt: now,
      status: "PREPARING",
      type: payload.type || "DINE_IN",
      syncStatus: "LOCAL_ONLY",

      // FLATTENED DATA for the UI to read correctly:
      items: payload.items,
      subtotal: subtotal,
      totalAmount: totalAmount,
      customerName: payload.customerName,
      tableNumber: payload.tableNumber,

      // Keep payload for the background sync to use
      payload: payload,
    };

    await db.orders.add(order);
    return order;
  },

  /**
   * Updates only metadata (status/updatedAt)
   */
  async updateStatus(
    clientOrderId: string,
    status: string,
    paymentStatus?: string,
  ) {
    const now = new Date().toISOString();
    await db.orders
      .where("clientOrderId")
      .equals(clientOrderId)
      .modify((order) => {
        order.status = status;
        order.updatedAt = now;
        order.syncStatus = "LOCAL_ONLY";

        // Update nested payment status safely
        if ((order as any).payload) {
          (order as any).payload.paymentStatus = paymentStatus;
        }
      });
  },

  /**
   * Gets all orders that need syncing
   */
  async getPendingOrders() {
    return await db.orders
      .filter((o) => o.syncStatus === "LOCAL_ONLY" || o.syncStatus === "FAILED")
      .toArray();
  },

  /**
   * Updates sync status after server response
   */
  async markAsSynced(clientOrderId: string, serverData: any) {
    await db.orders.where("clientOrderId").equals(clientOrderId).modify({
      syncStatus: "SYNCED",
      serverOrderId: serverData.id,
      status: serverData.status, // Adopt server status in case of conflict resolution
      updatedAt: serverData.updatedAt,
      syncError: null,
    });
  },
};
