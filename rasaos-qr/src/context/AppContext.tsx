import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/dexie/dexie";

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

import { callServer } from "../lib/helpers";

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [tableNumber, setTableNumber] = useState<string | null>(null);

  const categories = menu ? menu.categories : [];
  const menuItems = categories.flatMap((c) => c.items);

  const cart = useLiveQuery(() => db.cart.toArray()) || [];

  // Function to load the restaurant data if missing
  const fetchRestaurantData = useCallback(
    async (slug: string) => {
      // If we already have the data for this slug, don't re-fetch
      if (restaurant?.slug === slug) return true;

      setIsLoading(true);
      setError(null);
      try {
        const res = await callServer(`/menu/public/${slug}`);
        if (!res.success)
          throw new Error(res.message || "Failed to fetch restaurant menu");

        const data = res.data;
        setRestaurant(data.restaurant);
        setMenu(data.menu || null);

        // Save to Dexie recentRestaurants
        if (data.restaurant) {
          await db.recentRestaurants.put({
            id: data.restaurant.id,
            slug: data.restaurant.slug,
            name: data.restaurant.name,
            lastVisited: Date.now(),
          });
        }

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

  const addToCart = async (
    item: MenuItem,
    quantity = 1,
    variantId?: string,
    addons: SelectedAddon[] = [],
  ) => {
    const variant = variantId
      ? item.variants.find((v) => v.id === variantId)
      : item.variants[0] || null;
    const variantName = variant ? variant.name : undefined;
    const basePrice = variant ? variant.price : 0;
    const addonTotal = addons.reduce((sum, a) => sum + a.price, 0);
    const totalItemPrice = basePrice + addonTotal;

    const existingCart = await db.cart.toArray();
    const configKey = `${item.id}-${variantId}-${addons
      .map((a) => a.addonId)
      .sort()
      .join(",")}`;

    const existingItem = existingCart.find((ci) => {
      const existingKey = `${ci.menuItemId}-${ci.variantId}-${(
        ci.selectedAddons || []
      )
        .map((a) => a.addonId)
        .sort()
        .join(",")}`;
      return existingKey === configKey;
    });

    if (existingItem) {
      await db.cart.update(existingItem.id, {
        quantity: existingItem.quantity + quantity,
      });
    } else {
      await db.cart.add({
        id: Math.random().toString(36).substr(2, 9),
        menuItemId: item.id,
        variantId: variant?.id,
        name: item.name,
        variantName,
        selectedAddons: addons,
        price: totalItemPrice,
        quantity,
      });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    await db.cart.delete(cartItemId);
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await db.cart.delete(cartItemId);
    } else {
      await db.cart.update(cartItemId, { quantity });
    }
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
