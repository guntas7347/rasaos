import { Router } from "express";
import {
  createMenu,
  getMenu,
  getPublicMenuBySlug,
  getPublicMenuBySlugSchema,
  createMenuSchema,
  updateMenuSchema,
  updateMenu,
  deleteMenu,
  createCategory,
  updateCategory,
  deleteCategory,
  createCategorySchema,
  updateCategorySchema,
  createItem,
  updateItem,
  deleteItem,
  createItemSchema,
  updateItemSchema,
  createVariant,
  updateVariant,
  deleteVariant,
  createVariantSchema,
  updateVariantSchema,
  bulkAddMenu,
  bulkAddMenuSchema,
} from "./menu.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireTenant } from "../../middlewares/tenant.middleware";

const router = Router();

// Public Routes
router.get(
  "/public/:slug",
  validateRequest(getPublicMenuBySlugSchema),
  getPublicMenuBySlug,
);

router.use(authenticate, requireTenant);

// Menu
router.get("/", getMenu);
router.post("/", validateRequest(createMenuSchema), createMenu);
router.patch("/", validateRequest(updateMenuSchema), updateMenu);
router.delete("/", deleteMenu);
router.post("/:menuId/bulk", validateRequest(bulkAddMenuSchema), bulkAddMenu);

// Categories
router.post(
  "/categories",
  validateRequest(createCategorySchema),
  createCategory,
);
router.patch(
  "/categories/:id",
  validateRequest(updateCategorySchema),
  updateCategory,
);
router.delete("/categories/:id", deleteCategory);

// Items
router.post("/items", validateRequest(createItemSchema), createItem);
router.patch("/items/:id", validateRequest(updateItemSchema), updateItem);
router.delete("/items/:id", deleteItem);

// Variants
router.post("/variants", validateRequest(createVariantSchema), createVariant);
router.patch(
  "/variants/:id",
  validateRequest(updateVariantSchema),
  updateVariant,
);
router.delete("/variants/:id", deleteVariant);

export default router;
