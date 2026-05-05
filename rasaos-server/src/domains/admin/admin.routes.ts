import { Router } from "express";
import {
  getRestaurants,
  getRestaurantById,
  createSubscription,
  createSubscriptionSchema,
  updateRestaurant,
  updateAdminRestaurantSchema,
  deleteSubscription,
} from "./admin.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRoles } from "../../middlewares/tenant.middleware";

const router = Router();

// All routes require ADMIN role
router.use(authenticate, requireRoles(["ADMIN"]));

// GET restaurants - return array with name, plan, status, id
router.get("/restaurants", getRestaurants);

// GET restaurant by ID - return name, slug, email, sub history
router.get("/restaurant/:id", getRestaurantById);

// POST subscription for restaurant
router.post(
  "/subscription/:restaurantId",
  validateRequest(createSubscriptionSchema),
  createSubscription,
);

// POST (or PATCH) restaurant by ID - update name/slug
router.post(
  "/restaurant/:id",
  validateRequest(updateAdminRestaurantSchema),
  updateRestaurant,
);

// DELETE subscription
router.delete("/subscription/:subscriptionId", deleteSubscription);

export default router;
