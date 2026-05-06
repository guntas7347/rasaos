import { callServer } from "../helpers";
import { db } from "./dexie";
import { OrderService } from "./order-service";

export const SyncService = {
  /**
   * Pushes a specific order to the /order/sync endpoint
   */
  async syncOrder(clientOrderId: string) {
    const order = await db.orders
      .where("clientOrderId")
      .equals(clientOrderId)
      .first();
    if (!order || order.syncStatus === "SYNCED") return;

    try {
      const response = await callServer("/order/sync", {
        method: "POST",
        data: {
          clientOrderId: order.clientOrderId,
          updatedAt: order.updatedAt, // Used for conflict resolution
          status: order.status,
          type: order.type,
          items: order.payload.items,
          adjustments: order.payload.adjustments,
          // Add any other metadata from payload
          customerName: order.payload.customerName,
          tableNumber: order.payload.tableNumber,
        },
      });

      if (response.success) {
        // serverResponse.data.order contains the final state (with taxes/ids)
        await OrderService.markAsSynced(clientOrderId, response.data.order);
        return { success: true };
      }

      throw new Error(response.message || "Server rejected sync");
    } catch (err: any) {
      await db.orders.where("clientOrderId").equals(clientOrderId).modify({
        syncStatus: "FAILED",
        syncError: err.message,
      });
      return { success: false, error: err.message };
    }
  },

  /**
   * Background task: syncs all pending orders
   */
  async syncPending() {
    if (!navigator.onLine) return;
    const pending = await db.orders
      .filter((o) => o.syncStatus === "LOCAL_ONLY" || o.syncStatus === "FAILED")
      .toArray();

    // We sync sequentially to avoid race conditions on the same order
    for (const order of pending) {
      await this.syncOrder(order.clientOrderId);
    }
  },
};
