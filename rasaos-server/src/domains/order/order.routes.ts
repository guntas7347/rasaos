import { Router } from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  createOrderSchema,
  updateOrderStatusSchema,
  createStaffOrderSchema,
  createStaffOrder,
  getCustomerOrders,
  deleteOrder,
} from "./order.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireTenant } from "../../middlewares/tenant.middleware";

const router = Router();

// Public QR Orders
router.post("/", validateRequest(createOrderSchema), createOrder);
router.get("/customer", getCustomerOrders);

// Staff access
router.post(
  "/staff",
  authenticate,
  requireTenant,
  validateRequest(createStaffOrderSchema),
  createStaffOrder,
);
router.get("/", authenticate, requireTenant, getOrders);
router.patch(
  "/:id/status",
  authenticate,
  requireTenant,
  validateRequest(updateOrderStatusSchema),
  updateOrderStatus,
);

router.delete("/:id", authenticate, requireTenant, deleteOrder);

export default router;
