import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { success, error, uuid } from "../../lib/helpers";

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
