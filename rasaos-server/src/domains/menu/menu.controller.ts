import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { success, error } from "../../lib/helpers";

export const createMenuSchema = z.object({
  body: z.object({}).optional(),
});

export const getPublicMenuBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
});

export const getMenu = async (req: AuthRequest, res: Response) => {
  const menu = await prisma.menu.findUnique({
    where: {
      restaurantId: req.user!.restaurantId!,
    },
    include: {
      categories: {
        where: { deletedAt: null },
        orderBy: { order: "asc" },
        include: {
          items: {
            where: { deletedAt: null },
            include: {
              variants: {
                where: { deletedAt: null },
              },
            },
          },
        },
      },
    },
  });

  if (!menu || menu.deletedAt) {
    return error(res, 404, "Menu not found");
  }

  return success(res, menu);
};

export const getPublicMenuBySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;

    const restaurant = await prisma.restaurant.findFirst({
      where: { slug, deletedAt: null, isActive: true },
    });

    if (!restaurant) {
      return error(res, 404, "Restaurant not found");
    }

    // -------------------------
    // FETCH MENU
    // -------------------------

    const menu = await prisma.menu.findUnique({
      where: {
        restaurantId: restaurant.id,
      },
      include: {
        categories: {
          where: { deletedAt: null },
          orderBy: { order: "asc" },
          include: {
            items: {
              where: { deletedAt: null, isActive: true },
              include: {
                variants: {
                  where: { deletedAt: null },
                },
              },
            },
          },
        },
      },
    });

    if (menu?.deletedAt || !menu?.isActive) {
      return error(res, 404, "Menu not found");
    }

    return success(res, {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        taxRate: Number(restaurant.taxRate),
        taxMode: restaurant.taxMode,
      },
      menu,
    });
  } catch (err) {
    return error(res, 500, "Failed to fetch public menu");
  }
};

export const createMenu = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.menu.findUnique({
      where: { restaurantId: req.user!.restaurantId! },
    });

    if (existing && !existing.deletedAt) {
      return error(res, 400, "Menu already exists for this restaurant");
    }

    if (existing && existing.deletedAt) {
      const restored = await prisma.menu.update({
        where: { id: existing.id },
        data: { deletedAt: null, isActive: true },
      });
      return success(res, restored);
    }

    const menu = await prisma.menu.create({
      data: {
        restaurantId: req.user!.restaurantId!,
      },
    });
    res.status(201);
    return success(res, menu);
  } catch (err) {
    return error(res, 500, "Failed to create menu");
  }
};

export const updateMenuSchema = z.object({
  body: z.object({
    isActive: z.boolean().optional(),
  }),
});

export const updateMenu = async (req: AuthRequest, res: Response) => {
  try {
    const { isActive } = req.body;

    const menu = await prisma.menu.findUnique({
      where: { restaurantId: req.user!.restaurantId! },
    });

    if (!menu || menu.deletedAt) {
      return error(res, 404, "Menu not found");
    }

    const updated = await prisma.menu.update({
      where: { id: menu.id },
      data: { isActive },
    });

    return success(res, updated);
  } catch (err) {
    return error(res, 500, "Failed to update menu");
  }
};

export const deleteMenu = async (req: AuthRequest, res: Response) => {
  try {
    const menu = await prisma.menu.findUnique({
      where: { restaurantId: req.user!.restaurantId! },
    });

    if (!menu || menu.deletedAt) {
      return error(res, 404, "Menu not found");
    }

    await prisma.menu.update({
      where: { id: menu.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return success(res, null, "Menu deleted successfully");
  } catch (err) {
    return error(res, 500, "Failed to delete menu");
  }
};

// =======================
// CATEGORIES
// =======================

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    order: z.number().int().optional(),
    imageUrl: z.string().optional(),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    menuId: z.string().uuid(),
    name: z.string().min(1),
    order: z.number().int().optional(),
    imageUrl: z.string().optional(),
  }),
});

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { menuId, name, order, imageUrl } = req.body;

    // Verify menu belongs to this restaurant
    const menu = await prisma.menu.findFirst({
      where: {
        id: menuId,
        restaurantId: req.user!.restaurantId!,
        deletedAt: null,
      },
    });

    if (!menu) {
      return error(res, 404, "Menu not found");
    }

    const category = await prisma.category.create({
      data: { menuId, name, order, imageUrl },
    });
    res.status(201);
    return success(res, category);
  } catch (err) {
    return error(res, 500, "Failed to create category");
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, order, imageUrl } = req.body;

    const category = await prisma.category.findFirst({
      where: {
        id,
        menu: { restaurantId: req.user!.restaurantId! },
        deletedAt: null,
      },
    });

    if (!category) {
      return error(res, 404, "Category not found");
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name, order, imageUrl },
    });
    return success(res, updated);
  } catch (err) {
    return error(res, 500, "Failed to update category");
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const category = await prisma.category.findFirst({
      where: {
        id,
        menu: { restaurantId: req.user!.restaurantId! },
        deletedAt: null,
      },
    });

    if (!category) {
      return error(res, 404, "Category not found");
    }

    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return success(res, null, "Category deleted successfully");
  } catch (err) {
    return error(res, 500, "Failed to delete category");
  }
};

// =======================
// ITEMS
// =======================

export const updateItemSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createItemSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
  }),
});

export const createItem = async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, name, description, imageUrl } = req.body;

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        menu: { restaurantId: req.user!.restaurantId! },
        deletedAt: null,
      },
    });

    if (!category) {
      return error(res, 404, "Category not found");
    }

    const item = await prisma.item.create({
      data: { categoryId, name, description, imageUrl },
    });
    res.status(201);
    return success(res, item);
  } catch (err) {
    return error(res, 500, "Failed to create item");
  }
};

export const updateItem = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, description, isActive, imageUrl } = req.body;

    const item = await prisma.item.findFirst({
      where: {
        id,
        category: { menu: { restaurantId: req.user!.restaurantId! } },
        deletedAt: null,
      },
    });

    if (!item) {
      return error(res, 404, "Item not found");
    }

    const updated = await prisma.item.update({
      where: { id },
      data: { name, description, isActive, imageUrl },
    });
    return success(res, updated);
  } catch (err) {
    return error(res, 500, "Failed to update item");
  }
};

export const deleteItem = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const item = await prisma.item.findFirst({
      where: {
        id,
        category: { menu: { restaurantId: req.user!.restaurantId! } },
        deletedAt: null,
      },
    });

    if (!item) {
      return error(res, 404, "Item not found");
    }

    await prisma.item.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return success(res, null, "Item deleted successfully");
  } catch (err) {
    return error(res, 500, "Failed to delete item");
  }
};

// =======================
// VARIANTS
// =======================

export const updateVariantSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    price: z.number().int().optional(),
  }),
});

export const createVariantSchema = z.object({
  body: z.object({
    itemId: z.string().uuid(),
    name: z.string().min(1),
    price: z.number().int(),
  }),
});

export const createVariant = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId, name, price } = req.body;

    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        category: { menu: { restaurantId: req.user!.restaurantId! } },
        deletedAt: null,
      },
    });

    if (!item) {
      return error(res, 404, "Item not found");
    }

    const variant = await prisma.variant.create({
      data: { itemId, name, price },
    });
    res.status(201);
    return success(res, variant);
  } catch (err) {
    return error(res, 500, "Failed to create variant");
  }
};

export const updateVariant = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, price } = req.body;

    const variant = await prisma.variant.findFirst({
      where: {
        id,
        item: { category: { menu: { restaurantId: req.user!.restaurantId! } } },
        deletedAt: null,
      },
    });

    if (!variant) {
      return error(res, 404, "Variant not found");
    }

    const updated = await prisma.variant.update({
      where: { id },
      data: { name, price },
    });
    return success(res, updated);
  } catch (err) {
    return error(res, 500, "Failed to update variant");
  }
};

export const deleteVariant = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const variant = await prisma.variant.findFirst({
      where: {
        id,
        item: { category: { menu: { restaurantId: req.user!.restaurantId! } } },
        deletedAt: null,
      },
    });

    if (!variant) {
      return error(res, 404, "Variant not found");
    }

    await prisma.variant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return success(res, null, "Variant deleted successfully");
  } catch (err) {
    return error(res, 500, "Failed to delete variant");
  }
};

// =======================
// BULK OPERATIONS
// =======================

export const bulkAddMenuSchema = z.object({
  params: z.object({
    menuId: z.string().uuid(),
  }),
  body: z.array(
    z.object({
      name: z.string().min(1),
      order: z.number().int().optional(),
      imageUrl: z.string().optional(),
      items: z
        .array(
          z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            imageUrl: z.string().optional(),
            variants: z
              .array(
                z.object({
                  name: z.string().min(1),
                  price: z.number().int(),
                }),
              )
              .optional(),
          }),
        )
        .optional(),
    }),
  ),
});

export const bulkAddMenu = async (req: AuthRequest, res: Response) => {
  try {
    const menuId = req.params.menuId as string;
    const categories = req.body;

    const menu = await prisma.menu.findFirst({
      where: {
        id: menuId,
        restaurantId: req.user!.restaurantId!,
        deletedAt: null,
      },
    });

    if (!menu) {
      return error(res, 404, "Menu not found");
    }

    const createdCategories = await prisma.$transaction(
      async (tx) => {
        const results = [];
        for (const cat of categories) {
          const category = await tx.category.create({
            data: {
              menuId,
              name: cat.name,
              order: cat.order,
              imageUrl: cat.imageUrl,
            },
          });

          if (cat.items && cat.items.length > 0) {
            for (const item of cat.items) {
              const createdItem = await tx.item.create({
                data: {
                  categoryId: category.id,
                  name: item.name,
                  description: item.description,
                  imageUrl: item.imageUrl,
                },
              });

              if (item.variants && item.variants.length > 0) {
                for (const variant of item.variants) {
                  const createdVariant = await tx.variant.create({
                    data: {
                      itemId: createdItem.id,
                      name: variant.name,
                      price: variant.price,
                    },
                  });
                }
              }
            }
          }

          const fullCategory = await tx.category.findUnique({
            where: { id: category.id },
            include: {
              items: {
                include: { variants: true },
              },
            },
          });

          results.push(fullCategory);
        }
        return results;
      },
      { timeout: 30000 },
    );

    res.status(201);
    return success(res, createdCategories);
  } catch (err) {
    console.log(err);
    return error(res, 500, "Failed to bulk add menu");
  }
};
