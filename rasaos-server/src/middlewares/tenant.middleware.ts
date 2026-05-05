import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { Role } from "../../prisma/generated/prisma/client";
import { prisma } from "../lib/prisma";
import { error } from "../lib/helpers";

export const requireTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;

  if (!user) {
    return error(res, 401, "Unauthorized");
  }

  // @ts-ignore
  if (user.role === "ADMIN") {
    return next();
  }

  if (!user.restaurantId) {
    return error(res, 403, "Forbidden: User is not assigned to a restaurant");
  }

  const subscription = await prisma.subscriptionPeriod.findFirst({
    where: {
      restaurantId: user.restaurantId,
      periodEnd: {
        gte: new Date(),
      },
    },
  });

  if (!subscription) {
    return error(res, 402, "Forbidden: Subscription Period has expired");
  }

  next();
};

export const requireRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as string)) {
      console.error("Forbidden: Insufficient permissions", req.user?.email);
      return error(res, 403, "Forbidden: Insufficient permissions");
    }
    next();
  };
};
