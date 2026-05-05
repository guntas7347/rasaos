import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { env } from "../env";

export type Variant = {
  id: string;
  itemId: string;
  name: string;
  price: number;
};

export type Addon = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  imageUrl: string | null;
  variants: Variant[];
  price?: number; // legacy backward compatibility / base price
  image?: string; // legacy mapping
  recommended?: boolean;
};

export type Category = {
  id: string;
  menuId: string;
  name: string;
  order: number;
  items: MenuItem[];
  addons: Addon[];
  imageUrl?: string; // legacy mapped image
  itemCount?: number; // legacy mapped
};

export type Menu = {
  id: string;
  restaurantId: string;
  name: string;
  isActive: boolean;
  categories: Category[];
};

export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  taxRate: number;
  taxMode: "EXCLUSIVE" | "INCLUSIVE";
};

export type SelectedAddon = {
  addonId: string;
  name: string;
  price: number;
};

export type CartItemType = {
  id: string; // unique ID for cart item
  menuItemId: string;
  variantId?: string; // which variant was chosen (if applicable)
  name: string;
  variantName?: string;
  selectedAddons?: SelectedAddon[];
  price: number; // calculated base + addons
  quantity: number;
};

type AppContextType = {
  isLoading: boolean;
  error: string | null;
  restaurant: Restaurant | null;
  menu: Menu | null;

  // Flattened helpers for easy access matching legacy format
  categories: Category[];
  menuItems: MenuItem[];

  fetchRestaurantData: (slug: string) => Promise<boolean>;

  cart: CartItemType[];
  addToCart: (
    item: MenuItem,
    quantity?: number,
    variantId?: string,
    addons?: SelectedAddon[],
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  cartTotal: number;
  cartCount: number;
  tableNumber: string | null;
  setTableNumber: (table: string | null) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [tableNumber, setTableNumber] = useState<string | null>(null);

  // Computed flat lists mimicking previous setup
  const categories = menu
    ? menu.categories.map((c) => ({
        ...c,
        // Add legacy fields for backward compatibility with UI
        itemCount: c.items.length,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB9KTFRw0p2QCcZ2eYZI5d4Z48YSfsH8jsU-P4A_V_MGvl9MW3KJ_zAIHaiY8GzahKYTBfGBH25zOrJ8TzhRivmQFZWOqcDgLILMBRa6ZptaxuZfAqn5iHgtG4tTJ87hAmgOooP5WCIT5elnzJmkK64f4PD-cZj4ZIIEGDjdRN_UfVPQyBVH_Ddhbn0x8f0ZBc7LJpTqNkCp98K_OZrKSu46lm-kqkSnFFpmgQL-6MKvPWAhasILrxDEMIbVnOihrrebIqrG_1OPfs",
      }))
    : [];

  const menuItems = categories.flatMap((c) =>
    c.items.map((item) => ({
      ...item,
      // Provide a legacy image mapping and base price (lowest variant price as fallback)
      image:
        item.imageUrl ||
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAkcojwr_D_m6cBU1ellz9g3sfwzRYJdjXKmf7rn6wYIPXt3yESkSxWHcQ9jMDrtAbKoDZvAhMG6hS_V3VDc0CIXfyO3cndKcpXUjmqN9jdZRnemq2F1gnJfZA9K1cJusr7_Z6FqrxWTF5xxSl0LunAphhOM0513Sf4apEeVCGxjSlzxjUInz1T3ga0eV_P5xyMjcRb1gqXcz-3qsAfJa4P5ukrgqHZLvXXfUqZo_fl65nOUKkuE9R8mnoeevEBKO0RzRg0Y3VY59I",
      price:
        item.variants?.length > 0
          ? Math.min(...item.variants.map((v) => v.price))
          : 0,
    })),
  );

  const [cart, setCart] = useState<CartItemType[]>([]);

  // Function to load the restaurant data if missing
  const fetchRestaurantData = useCallback(
    async (slug: string) => {
      // If we already have the data for this slug, don't re-fetch
      if (restaurant?.slug === slug) return true;

      setIsLoading(true);
      setError(null);
      try {
        const endpoint = `${env.API_URL}/menu/public/${slug}`;

        const res = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch restaurant menu");

        const data = await res.json();
        setRestaurant(data.restaurant);
        setMenu(data.menu || null);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error(err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [restaurant?.slug],
  );

  const addToCart = (
    item: MenuItem,
    quantity = 1,
    variantId?: string,
    addons: SelectedAddon[] = [],
  ) => {
    // Base cart calculation
    const variant = variantId
      ? item.variants.find((v) => v.id === variantId)
      : item.variants[0] || null;
    const variantName = variant ? variant.name : undefined;
    const basePrice = variant ? variant.price : 0;
    const addonTotal = addons.reduce((sum, a) => sum + a.price, 0);
    const totalItemPrice = basePrice + addonTotal;

    setCart((prev) => {
      // Logic for strict cart deduplication if items match exactly (same variant, same addons)
      // Here we simplify by generating a unique ID per cart ad, but if needed we could match configurations

      const configKey = `${item.id}-${variantId}-${addons
        .map((a) => a.addonId)
        .sort()
        .join(",")}`;

      // Let's see if this exact configuration exists
      const existingConfigIndex = prev.findIndex((ci) => {
        const existingKey = `${ci.menuItemId}-${ci.variantId}-${(
          ci.selectedAddons || []
        )
          .map((a) => a.addonId)
          .sort()
          .join(",")}`;
        return existingKey === configKey;
      });

      if (existingConfigIndex >= 0) {
        const next = [...prev];
        next[existingConfigIndex] = {
          ...next[existingConfigIndex],
          quantity: next[existingConfigIndex].quantity + quantity,
        };
        return next;
      }

      return [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          menuItemId: item.id,
          variantId: variant?.id,
          name: item.name,
          variantName,
          selectedAddons: addons,
          price: totalItemPrice,
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) return prev.filter((ci) => ci.id !== cartItemId);
      return prev.map((ci) =>
        ci.id === cartItemId ? { ...ci, quantity } : ci,
      );
    });
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        isLoading,
        error,
        restaurant,
        menu,
        categories,
        menuItems,
        fetchRestaurantData,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartTotal,
        cartCount,
        tableNumber,
        setTableNumber,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
