import type { Order, OrderStatus, PaymentStatus } from "@/types";
import { db } from "@/lib/dexie/db";
import { v4 as uuid } from "uuid";

export const createOrder = async (payload: any) => {
  const now = new Date().toISOString();

  const subtotal =
    payload.subtotal ??
    payload.items.reduce(
      (acc: number, item: any) => acc + item.unitPrice * item.quantity,
      0,
    );

  const totalAmount = payload.totalAmount ?? subtotal;

  const order: Order = {
    id: uuid(),
    clientOrderId: payload.clientOrderId || uuid(),
    createdAt: now,
    updatedAt: now,
    status: "PREPARING",
    type: payload.type || "DINE_IN",
    syncStatus: "LOCAL_ONLY",
    items: payload.items,
    adjustments: payload.adjustments || [],
    subtotal: subtotal,
    totalAmount: totalAmount,
    customerName: payload.customerName || null,
    tableNumber: payload.tableNumber || null,
    payload: payload,
  };

  await db.orders.add(order);
  return order;
};

export const updateOrderStatus = async (
  clientOrderId: string,
  status: OrderStatus, // <-- Use strict enum instead of string
  paymentStatus?: PaymentStatus, // <-- Use strict enum instead of string
) => {
  const now = new Date().toISOString();

  await db.orders
    .where("clientOrderId")
    .equals(clientOrderId)
    .modify((order) => {
      // TypeScript automatically knows `order` is of type `Order`
      order.status = status;
      order.updatedAt = now;
      order.syncStatus = "LOCAL_ONLY";

      // ONLY update payment status if it was explicitly passed into the function
      if (paymentStatus !== undefined) {
        // 1. Update the flattened root property (Crucial for fast Dexie queries)
        order.paymentStatus = paymentStatus;

        // 2. Update the payload (What gets synced to your Prisma backend)
        if (order.payload) {
          // Depending on how you structured your payload, update it here.
          // If you kept the nested payment object:
          if (!order.payload.payment) {
            order.payload.payment = {
              status: paymentStatus,
              amount: order.totalAmount,
              provider: "CASH",
            }; // fallback
          } else {
            order.payload.payment.status = paymentStatus;
          }
        }
      }
    });
};

export const OrderService = {
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
