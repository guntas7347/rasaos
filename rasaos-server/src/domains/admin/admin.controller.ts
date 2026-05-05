import { Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { success, error } from "../../lib/helpers";

export const getRestaurants = async (req: AuthRequest, res: Response) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        subscriptionHistory: true,
      },
    });

    const now = new Date();

    const formattedRestaurants = restaurants.map((restaurant) => {
      // Find active subscription if any
      const activeSub = restaurant.subscriptionHistory.find(
        (sub) => sub.periodStart <= now && sub.periodEnd >= now,
      );

      return {
        id: restaurant.id,
        name: restaurant.name,
        planName: activeSub ? activeSub.plan : null,
        subscriptionStatus: activeSub ? "ACTIVE" : "INACTIVE",
      };
    });

    return success(res, formattedRestaurants);
  } catch (err) {
    console.error("Error fetching restaurants:", err);
    return error(res, 500, "Failed to fetch restaurants");
  }
};

export const getRestaurantById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        users: true,
        subscriptionHistory: {
          orderBy: { periodStart: "desc" },
        },
      },
    });

    if (!restaurant) {
      return error(res, 404, "Restaurant not found");
    }

    const now = new Date();

    return success(res, {
      name: restaurant.name,
      slug: restaurant.slug,
      userEmail: restaurant.users[0]?.email || null,
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
    console.error("Error fetching restaurant:", err);
    return error(res, 500, "Failed to fetch restaurant details");
  }
};

export const createSubscriptionSchema = z.object({
  body: z
    .object({
      plan: z.string().min(1, "Plan name is required"),
      periodStart: z.coerce.date(),
      periodEnd: z.coerce.date(),
    })
    .refine((data) => new Date(data.periodStart) < new Date(data.periodEnd), {
      message: "periodEnd must be after periodStart",
      path: ["periodEnd"],
    }),
});

export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const restaurantId = req.params.restaurantId as string;
    const { plan, periodStart, periodEnd } = req.body;

    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    // Check for overlap
    // An overlap occurs if an existing subscription has:
    // existingStart < newEnd AND existingEnd > newStart
    const overlappingSub = await prisma.subscriptionPeriod.findFirst({
      where: {
        restaurantId,
        periodStart: { lt: end },
        periodEnd: { gt: start },
      },
    });

    if (overlappingSub) {
      return error(
        res,
        400,
        "Subscription period overlaps with an existing subscription",
        { overlap: overlappingSub },
      );
    }

    const subscription = await prisma.subscriptionPeriod.create({
      data: {
        restaurantId,
        plan,
        periodStart: start,
        periodEnd: end,
      },
    });

    return success(res, subscription);
  } catch (err) {
    console.error("Error creating subscription:", err);
    return error(res, 500, "Failed to create subscription");
  }
};

export const updateAdminRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    slug: z.string().min(2, "Slug must be at least 2 characters").optional(),
  }),
});

export const updateRestaurant = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, slug } = req.body;

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
      },
    });

    return success(res, restaurant);
  } catch (err) {
    console.error("Error updating restaurant:", err);
    return error(res, 500, "Failed to update restaurant");
  }
};

export const deleteSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const subscriptionId = req.params.subscriptionId as string;

    await prisma.subscriptionPeriod.delete({
      where: { id: subscriptionId },
    });

    return success(res, null, "Subscription deleted successfully");
  } catch (err) {
    console.error("Error deleting subscription:", err);
    return error(res, 500, "Failed to delete subscription");
  }
};
