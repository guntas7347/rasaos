import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { success, error, uuid } from "../../lib/helpers";

// 1. Validation Schema
export const createOnlineOrderSchema = z.object({
  body: z.object({
    restaurantId: z.string().uuid(),
    type: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]).optional(),
    customerName: z.string().optional(),
    customerMobile: z.string(), // Required for online orders
    customerAddress: z.string().optional(),
    tableNumber: z.string().optional(),
    note: z.string().optional(),
    items: z
      .array(
        z.object({
          itemId: z.string().uuid(),
          variantId: z.string().uuid().optional(),
          quantity: z.number().int().positive(),
        }),
      )
      .min(1, "Cart cannot be empty"),
  }),
});

// 2. Controller logic
export const createOnlineOrder = async (req: Request, res: Response) => {
  try {
    const {
      restaurantId,
      type,
      customerName,
      customerMobile,
      customerAddress,
      tableNumber,
      note,
      items,
    } = req.body;

    // Verify restaurant is active
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId, isActive: true },
    });

    if (!restaurant) {
      return error(res, 404, "Restaurant not found or currently offline");
    }

    const result = await prisma.$transaction(async (tx) => {
      // -------------------------
      // CUSTOMER ID RESOLUTION
      // -------------------------
      let customerId = req.cookies?.customerId;
      if (!customerId) {
        customerId = uuid();
      }

      // Generate a stable clientOrderId for this new order
      const generatedClientOrderId = uuid();
      const now = new Date();

      // -------------------------
      // SECURE PRICE RESOLUTION
      // -------------------------
      let subtotal = 0;
      const orderItemsData = [];

      for (const itemRequest of items) {
        // Fetch the item and its variants straight from the DB
        const dbItem = await tx.item.findFirst({
          where: {
            id: itemRequest.itemId,
            category: { menu: { restaurantId } },
          },
          include: { variants: true },
        });

        if (!dbItem) {
          throw new Error(`Item not found in this restaurant menu`);
        }

        let actualUnitPrice = 0;
        let actualVariantName = null;
        let actualVariantId = itemRequest.variantId;

        // SERVER AUTHORITY: Determine the exact price
        if (itemRequest.variantId) {
          // Client provided a specific variant (e.g., Large Pizza)
          const matchedVariant = dbItem.variants.find(
            (v: any) => v.id === itemRequest.variantId,
          );
          if (!matchedVariant)
            throw new Error(`Invalid variant for item: ${dbItem.name}`);

          actualUnitPrice = matchedVariant.price;
          actualVariantName = matchedVariant.name;
        } else {
          // Client did not provide a variant. We must safely fall back.
          if (dbItem.variants.length === 0) {
            throw new Error(`Item "${dbItem.name}" has no price configured.`);
          } else if (dbItem.variants.length === 1) {
            // Safe fallback: Item only has one option (e.g., "Regular Cokę")
            actualUnitPrice = dbItem.variants[0].price;
            actualVariantName = dbItem.variants[0].name;
            actualVariantId = dbItem.variants[0].id;
          } else {
            // Ambiguous: Item has multiple sizes, but client didn't pick one.
            throw new Error(
              `Please select a specific size/variant for "${dbItem.name}".`,
            );
          }
        }

        // Calculate line total based on SECURE backend price
        const lineTotal = actualUnitPrice * itemRequest.quantity;
        subtotal += lineTotal;

        orderItemsData.push({
          itemId: dbItem.id,
          itemName: dbItem.name,
          variantId: actualVariantId,
          variantName: actualVariantName,
          unitPrice: actualUnitPrice, // Mapped to unitPrice for POS compatibility
          quantity: itemRequest.quantity,
          lineTotal: lineTotal,
          updatedAt: now, // Required field
        });
      }

      // -------------------------
      // TAX CALCULATION
      // -------------------------
      let taxAmount = 0;
      let finalTotal = subtotal;
      const taxes: any[] = [];

      if (restaurant.taxRate && Number(restaurant.taxRate) > 0) {
        const rate = Number(restaurant.taxRate) / 100;

        if (restaurant.taxMode === "EXCLUSIVE") {
          taxAmount = subtotal * rate;
          finalTotal += taxAmount;
        } else {
          // INCLUSIVE
          taxAmount = subtotal - subtotal / (1 + rate);
        }

        taxes.push({
          label: `Tax (${Number(restaurant.taxRate)}%)`,
          rate,
          appliedAmount: Math.round(taxAmount),
        });
      }

      finalTotal = Math.round(finalTotal);

      const pricingBreakdown = {
        subtotal: Math.round(subtotal),
        discounts: [], // Future promo code logic goes here
        taxes,
        charges: [], // Future delivery fee logic goes here
        finalTotal,
      };

      // -------------------------
      // ORDER CREATION
      // -------------------------
      const order = await tx.order.create({
        data: {
          restaurantId,
          customerId,
          clientOrderId: generatedClientOrderId,
          type: type || "DINE_IN",
          customerName,
          customerMobile,
          customerAddress,
          tableNumber,
          note,
          subtotal: Math.round(subtotal),
          totalAmount: finalTotal,
          pricingBreakdown,
          status: "PENDING",
          updatedAt: now,
          items: {
            create: orderItemsData,
          },
          payment: {
            create: {
              amount: finalTotal,
              status: "PENDING", // Online orders usually start pending until payment gateway confirmation
              provider: "CASH", // You can update this when implementing Stripe/Razorpay
            },
          },
        },
        include: { items: true, payment: true },
      });

      return { order, customerId };
    });

    // -------------------------
    // PERSIST CUSTOMER SESSION
    // -------------------------
    if (
      !req.cookies?.customerId ||
      req.cookies.customerId !== result.customerId
    ) {
      res.cookie("customerId", result.customerId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 Days
      });
    }

    res.status(201);
    return success(res, { order: result.order }, "Order placed successfully");
  } catch (err: any) {
    console.error("Online Order Error:", err);
    // Return safe error messages to the client (e.g., "Invalid variant for item...")
    return error(res, 400, err.message || "Failed to place order");
  }
};
