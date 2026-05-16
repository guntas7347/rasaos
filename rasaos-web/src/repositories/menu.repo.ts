import { localError } from "@/components/ui/ToasterProvider";
import { db } from "@/lib/dexie/db";
import type { MenuItem } from "@/types";

export async function getFullMenu(): Promise<any> {
  return await db.menu.toArray();
}

export async function syncMenuToLocalCache(menuTree: any): Promise<void> {
  if (!menuTree || !menuTree.categories) {
    localError("Invalid menu tree provided to syncMenuToLocalCache");
    return;
  }

  const flatMenuItems: MenuItem[] = menuTree.categories.flatMap(
    (category: any) => category.items,
  );

  await db.transaction("rw", db.menu, async () => {
    await db.menu.clear();
    await db.menu.bulkPut(flatMenuItems);
  });
}

export async function getItemsByCategory(
  categoryId: string,
): Promise<MenuItem[]> {
  return await db.menu.where("categoryId").equals(categoryId).toArray();
}

export async function getItemById(id: string): Promise<MenuItem | undefined> {
  return await db.menu.get(id);
}

export async function searchItems(searchQuery: string): Promise<MenuItem[]> {
  const lowerQuery = searchQuery.toLowerCase();
  return await db.menu
    .filter((item) => item.name.toLowerCase().includes(lowerQuery))
    .toArray();
}
