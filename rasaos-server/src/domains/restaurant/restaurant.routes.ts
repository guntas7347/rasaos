import { Router } from "express";
import {
  getRestaurantDetails,
  updateRestaurantSchema,
  updateRestaurantDetails,
} from "./restaurant.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRoles } from "../../middlewares/tenant.middleware";

const router = Router();

// Get current user's restaurant details
router.get("/", authenticate, requireRoles(["OWNER"]), getRestaurantDetails);

router.post(
  "/",
  authenticate,
  requireRoles(["OWNER"]),
  validateRequest(updateRestaurantSchema),
  updateRestaurantDetails,
);

export default router;
