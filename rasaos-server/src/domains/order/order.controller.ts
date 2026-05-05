import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { success, error } from "../../lib/helpers";
import crypto from "crypto";

export const createOrderSchema = z.object({
  body: z.object({
    restaurantId: z.string().uuid(),
    type: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]).optional(),
    customerName: z.string().optional(),
    customerMobile: z.string(),
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
      .min(1),
  }),
});

export const createOrder = async (req: Request, res: Response) => {
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

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId, isActive: true },
    });

    if (!restaurant) {
      return error(res, 404, "Restaurant not found");
    }

    const result = await prisma.$transaction(async (tx) => {
      // -------------------------
      // CUSTOMER ID RESOLUTION
      // -------------------------

      let customerId = req.cookies?.customerId;

      if (!customerId) {
        customerId = crypto.randomUUID();
      }

      // -------------------------
      // PRICE CALCULATION
      // -------------------------

      let subtotal = 0;
      const orderItemsData = [];

      for (const itemRequest of items) {
        const variant = await tx.variant.findFirst({
          where: {
            id: itemRequest.variantId,
            deletedAt: null,
            item: {
              category: {
                menu: { restaurantId },
              },
            },
          },
        });

        if (!variant) {
          throw new Error("Variant not found");
        }

        subtotal += variant.price * itemRequest.quantity;

        orderItemsData.push({
          variantName: variant.name,
          variantPrice: variant.price,
          quantity: itemRequest.quantity,
        });
      }

      // Taxes calculation
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
        discounts: [],
        taxes,
        charges: [],
        finalTotal,
      };

      // -------------------------
      // ORDER CREATION
      // -------------------------

      const order = await tx.order.create({
        data: {
          restaurantId,
          customerId,
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
          items: {
            create: orderItemsData,
          },
          payment: {
            create: {
              amount: finalTotal,
              status: "PENDING",
              provider: "CASH",
            },
          },
        },
        include: { items: true, payment: true },
      });

      return { order, customerId };
    });

    // -------------------------
    // SET COOKIE OUTSIDE TX
    // -------------------------

    if (
      !req.cookies?.customerId ||
      req.cookies.customerId !== result.customerId
    ) {
      res.cookie("customerId", result.customerId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });
    }

    res.status(201);
    return success(res, { order: result.order });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Failed to create order");
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  const { page = "1", date, id } = req.query;
  const pageNumber = parseInt(page as string, 10) || 1;
  const limit = 20;

  const where: any = {
    restaurantId: req.user!.restaurantId as string,
    deletedAt: null,
  };

  if (id) {
    where.id = { contains: id as string, mode: "insensitive" };
  } else if (date) {
    const startDate = new Date(date as string);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date as string);
    endDate.setHours(23, 59, 59, 999);

    where.createdAt = {
      gte: startDate,
      lte: endDate,
    };
  }

  // If a specific date is requested without an id, show all orders for that date.
  const shouldPaginate = !(date && !id);

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true, payment: true },
      orderBy: { createdAt: "desc" },
      ...(shouldPaginate && { skip: (pageNumber - 1) * limit, take: limit }),
    }),
    prisma.order.count({ where }),
  ]);

  return success(res, {
    orders,
    pagination: {
      total: totalOrders,
      page: pageNumber,
      limit: shouldPaginate ? limit : totalOrders,
      totalPages: shouldPaginate ? Math.ceil(totalOrders / limit) : 1,
    },
  });
};

export const getCustomerOrders = async (req: Request, res: Response) => {
  try {
    const customerId = req.cookies?.customerId;

    if (!customerId) {
      return success(res, { orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: {
        customerId,
        deletedAt: null,
      },
      include: { items: true, payment: true },
      orderBy: { createdAt: "desc" },
    });

    return success(res, { orders });
  } catch (err) {
    console.error("Error fetching customer orders:", err);
    return error(res, 500, "Failed to fetch customer orders");
  }
};

export const createStaffOrderSchema = z.object({
  body: z.object({
    type: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]).optional(),

    customerName: z.string().optional(),
    customerMobile: z.string().optional(),
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
      .min(1),

    // optional manual adjustments (staff only)
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

export const createStaffOrder = async (req: AuthRequest, res: Response) => {
  try {
    const restaurantId = req.user!.restaurantId as string;
    const {
      items,
      adjustments,
      type,
      customerName,
      customerMobile,
      tableNumber,
      note,
    } = req.body;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return error(res, 404, "Restaurant not found");
    }

    let subtotal = 0;
    const orderItemsData = [];

    for (const itemRequest of items) {
      const dbItem = await prisma.item.findFirst({
        where: { id: itemRequest.itemId, category: { menu: { restaurantId } } },
        include: { variants: true },
      });

      if (!dbItem) {
        return error(res, 404, `Item ${itemRequest.itemId} not found`);
      }

      let variantName = dbItem.name;
      let variantPrice = dbItem.variants[0]?.price || 0;

      if (itemRequest.variantId) {
        const variant = dbItem.variants.find(
          (v) => v.id === itemRequest.variantId,
        );
        if (variant) {
          variantName = `${dbItem.name} - ${variant.name}`;
          variantPrice = variant.price;
        }
      }

      const itemSubtotal = variantPrice * itemRequest.quantity;

      subtotal += itemSubtotal;

      orderItemsData.push({
        variantName,
        variantPrice,
        quantity: itemRequest.quantity,
      });
    }

    // Process adjustments
    const discounts: any[] = [];
    const charges: any[] = [];
    let totalDiscountAmount = 0;
    let totalChargeAmount = 0;

    if (adjustments) {
      for (const adj of adjustments) {
        let appliedAmount = 0;
        if (adj.mode === "PERCENTAGE") {
          appliedAmount = (subtotal * adj.value) / 100;
        } else {
          appliedAmount = adj.value;
        }

        if (adj.type === "DISCOUNT") {
          discounts.push({
            label: adj.label,
            type: adj.mode,
            value: adj.value,
            appliedAmount: -appliedAmount, // Negative to indicate reduction
          });
          totalDiscountAmount += appliedAmount;
        } else if (adj.type === "FEE" || adj.type === "SURCHARGE") {
          charges.push({
            label: adj.label,
            appliedAmount, // Positive
          });
          totalChargeAmount += appliedAmount;
        }
      }
    }

    const taxableAmount = subtotal - totalDiscountAmount;

    // Taxes
    const taxes: any[] = [];
    let taxAmount = 0;
    let finalTotal = taxableAmount;

    if (restaurant.taxRate && Number(restaurant.taxRate) > 0) {
      const rate = Number(restaurant.taxRate) / 100;

      if (restaurant.taxMode === "EXCLUSIVE") {
        taxAmount = taxableAmount * rate;
        finalTotal += taxAmount;
      } else {
        // INCLUSIVE
        taxAmount = taxableAmount - taxableAmount / (1 + rate);
      }

      taxes.push({
        label: `Tax (${Number(restaurant.taxRate)}%)`,
        rate,
        appliedAmount: Math.round(taxAmount),
      });
    }

    finalTotal = Math.round(finalTotal) + totalChargeAmount;

    const pricingBreakdown = {
      subtotal: Math.round(subtotal),
      discounts,
      taxes,
      charges,
      finalTotal: Math.round(finalTotal),
    };

    const order = await prisma.order.create({
      data: {
        restaurantId,
        type: type || "DINE_IN",
        customerName,
        customerMobile,
        tableNumber,
        note,
        subtotal: Math.round(subtotal),
        totalAmount: Math.round(finalTotal),
        pricingBreakdown,
        status: "PREPARING", // Pre-accepted since staff is taking it
        items: {
          create: orderItemsData,
        },
        payment: {
          create: {
            amount: Math.round(finalTotal),
            status: "COMPLETED", // Or PENDING depending on staff payment capturing flow
            provider: "CASH",
          },
        },
      },
      include: { items: true, payment: true },
    });

    res.status(201);
    return success(res, { order });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Failed to create staff order");
  }
};

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z
      .enum(["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"])
      .optional(),
    paymentStatus: z
      .enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"])
      .optional(),
  }),
});

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;

  const order = await prisma.order.findFirst({
    where: {
      id: id as string,
      restaurantId: req.user!.restaurantId as string,
    },
  });

  if (!order) {
    return error(res, 404, "Order not found");
  }

  // Ensure state transition logic here if needed (e.g. valid flow)

  const updatedOrder = await prisma.order.update({
    where: { id: id as string },
    data: {
      ...(status && { status }),
      ...(paymentStatus && {
        payment: {
          update: {
            status: paymentStatus,
          },
        },
      }),
    },
    include: {
      items: true,
      payment: true,
    },
  });

  return success(res, { order: updatedOrder });
};

export const deleteOrder = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const order = await prisma.order.findFirst({
    where: {
      id: id as string,
      restaurantId: req.user!.restaurantId as string,
      deletedAt: null,
    },
  });

  if (!order) {
    return error(res, 404, "Order not found");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: id as string },
    data: { deletedAt: new Date() },
  });

  return success(res, { order: updatedOrder });
};
