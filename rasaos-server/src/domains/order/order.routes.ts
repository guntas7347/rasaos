import { Router } from "express";
import {
  getOrders,
  updateOrderStatus,
  updateOrderStatusSchema,
  getCustomerOrders,
  deleteOrder,
} from "./order.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireTenant } from "../../middlewares/tenant.middleware";
import { syncStaffOrder, syncStaffOrderSchema } from "./sync/sync.controller";
import {
  createOnlineOrder,
  createOnlineOrderSchema,
} from "./online-order.controller";

const router = Router();

// Public QR Orders
router.post("/", validateRequest(createOnlineOrderSchema), createOnlineOrder);
router.get("/customer", getCustomerOrders);

router.get("/", authenticate, requireTenant, getOrders);
router.patch(
  "/:id/status",
  authenticate,
  requireTenant,
  validateRequest(updateOrderStatusSchema),
  updateOrderStatus,
);

router.delete("/:id", authenticate, requireTenant, deleteOrder);

// SYNC

router.post(
  "/sync",
  authenticate,
  requireTenant,
  validateRequest(syncStaffOrderSchema),
  syncStaffOrder,
);

export default router;
