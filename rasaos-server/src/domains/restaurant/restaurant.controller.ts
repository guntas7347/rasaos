import { Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { success, error } from "../../lib/helpers";

export const createRestaurantSchema = z.object({
  body: z.object({
    restaurantName: z.string().min(2),
    slug: z.string().min(2),
  }),
});

export const getRestaurantDetails = async (req: AuthRequest, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      return error(res, 404, "No restaurant associated with this user", {
        errorCode: "NO_RESTAURANT",
      });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { subscriptionHistory: true },
    });

    if (!restaurant) {
      return error(res, 404, "Restaurant not found");
    }

    const now = new Date();

    return success(res, {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      currency: restaurant.currency,
      taxRate: Number(restaurant.taxRate),
      taxMode: restaurant.taxMode,
      subscriptionHistory: restaurant.subscriptionHistory.map((sub) => ({
        id: sub.id,
        plan: sub.plan,
        status:
          sub.periodStart <= now && sub.periodEnd >= now
            ? "ACTIVE"
            : sub.periodEnd < now
              ? "EXPIRED"
              : "FUTURE",
        periodStart: sub.periodStart,
        periodEnd: sub.periodEnd,
      })),
    });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Failed to fetch restaurant details");
  }
};

export const updateRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    taxRate: z.number().nonnegative().optional(),
    taxMode: z.enum(["INCLUSIVE", "EXCLUSIVE"]).optional(),
    currency: z.string().min(3).max(3).optional(),
  }),
});

export const updateRestaurantDetails = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      return error(res, 404, "No restaurant associated with this user", {
        errorCode: "NO_RESTAURANT",
      });
    }

    const { name, slug, taxRate, taxMode, currency } = req.body;

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        name,
        slug,
        taxRate,
        taxMode,
        currency,
      },
    });

    return success(res, updatedRestaurant);
  } catch (err) {
    console.error(err);
    return error(res, 500, "Failed to update restaurant details");
  }
};
