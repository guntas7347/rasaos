import { Request, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { success, error } from "../../../lib/helpers";

import { z } from "zod";

export const syncStaffOrderSchema = z.object({
  body: z.object({
    // Required for matching and conflict resolution
    clientOrderId: z.string().uuid(),
    updatedAt: z.string().datetime(), // ISO string from Dexie

    // Optional for updates, required for creation
    type: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]).optional(),
    status: z
      .enum(["PREPARING", "READY", "SERVED", "COMPLETED", "CANCELLED"])
      .optional(),

    customerName: z.string().optional(),
    customerMobile: z.string().optional(),
    tableNumber: z.string().optional(),
    note: z.string().optional(),

    // Payment state
    paymentStatus: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),

    // Items (Required for initial creation, optional for status-only sync)
    items: z
      .array(
        z.object({
          itemId: z.string().uuid().optional(),
          variantId: z.string().uuid().optional(),
          itemName: z.string(),
          variantName: z.string().optional(),
          unitPrice: z.number().int().nonnegative(), // integer paise/cents
          quantity: z.number().int().positive(),
        }),
      )
      .optional(),

    // Optional manual adjustments
    adjustments: z
      .array(
        z.object({
          label: z.string(),
          type: z.enum(["DISCOUNT", "FEE", "SURCHARGE"]),
          mode: z.enum(["FIXED", "PERCENTAGE"]),
          value: z.number().nonnegative(),
        }),
      )
      .optional(),
  }),
});

export const syncStaffOrder = async (req: any, res: Response) => {
  try {
    const restaurantId = req.user.restaurantId;
    const {
      clientOrderId,
      items,
      adjustments,
      updatedAt: clientUpdatedAt,
      status,
      type,
      customerName,
      customerMobile,
      tableNumber,
      note,
      paymentStatus,
    } = req.body;

    if (!clientOrderId) return error(res, 400, "clientOrderId is required");

    // 1. Check if order already exists
    const existingOrder = await prisma.order.findUnique({
      where: {
        restaurantId_clientOrderId: { restaurantId, clientOrderId },
      },
      include: { items: true, payment: true },
    });

    if (existingOrder) {
      const serverTime = new Date(existingOrder.updatedAt).getTime();
      const clientTime = new Date(clientUpdatedAt).getTime();

      // 2. Conflict Resolution: Only update if client is newer
      if (clientTime > serverTime) {
        const updated = await prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            status: status || existingOrder.status,
            customerName,
            customerMobile,
            tableNumber,
            note,
            updatedAt: new Date(clientUpdatedAt), // Sync the actual edit time
            payment: {
              update: {
                status:
                  paymentStatus || existingOrder.payment?.status || "PENDING",
              },
            },
          },
          include: { items: true, payment: true },
        });
        return success(
          res,
          { order: updated, syncResult: "UPDATED" },
          "Order updated",
        );
      } else {
        // Server is newer - reject update and return server state
        return success(
          res,
          {
            order: existingOrder,
            syncResult: "CONFLICT_SERVER_WINS",
          },
          "Server has newer data",
        );
      }
    }

    // 3. Creation Logic (If order doesn't exist)
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) return error(res, 404, "Restaurant not found");

    // Pricing calculation (Server Authority)
    let subtotal = 0;
    const orderItemsData = items.map((item: any) => {
      const itemTotal = item.unitPrice * item.quantity;
      subtotal += itemTotal;
      return {
        itemId: item.itemId,
        variantId: item.variantId,
        itemName: item.itemName,
        variantName: item.variantName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: itemTotal,
      };
    });

    // ... (Calculate adjustments, taxes etc based on your previous logic)
    // For brevity, using a simple total calculation here:
    const finalTotal = subtotal; // Apply your full tax/adjustment logic here

    const newOrder = await prisma.order.create({
      data: {
        restaurantId,
        clientOrderId,
        type: type || "DINE_IN",
        status: status || "PREPARING",
        subtotal,
        totalAmount: finalTotal,
        updatedAt: new Date(clientUpdatedAt),
        items: { create: orderItemsData },
        payment: {
          create: {
            amount: finalTotal,
            status: paymentStatus || "COMPLETED",
            provider: "CASH",
          },
        },
      },
      include: { items: true, payment: true },
    });

    return success(
      res,
      { order: newOrder, syncResult: "CREATED" },
      "Order created",
    );
  } catch (err) {
    console.error("Sync Error:", err);
    return error(res, 500, "Sync failed");
  }
};
