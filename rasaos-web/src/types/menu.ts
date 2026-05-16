// src/types/menu.ts

export interface MenuVariant {
  id: string;
  itemId: string;
  name: string;
  price: number; // Integer (cents/paise)
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  variants: MenuVariant[]; // Included via Prisma
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategory {
  id: string;
  menuId: string;
  name: string;
  order: number | null;
  imageUrl: string | null;
  items: MenuItem[]; // Included via Prisma
  createdAt: string;
  updatedAt: string;
}

// The exact shape of the object returned by your getMenu API
export interface MenuResponse {
  id: string;
  restaurantId: string;
  categories: MenuCategory[];
  createdAt: string;
  updatedAt: string;
}
