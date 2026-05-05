import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { callServer } from "../../../lib/helpers";
import toast from "react-hot-toast";
import {
  Plus,
  Coffee,
  LayoutDashboard,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Power,
} from "lucide-react";

import { CategoryModal } from "../../../components/menu/CategoryModal";
import { ItemModal } from "../../../components/menu/ItemModal";
import { VariantModal } from "../../../components/menu/VariantModal";
import { BulkUploadModal } from "../../../components/menu/BulkUploadModal";
import { CurrencyIcon } from "../../../components/ui/CurrencyIcon";

export default function MenuManagementPage() {
  const { restaurant } = useAuth();
  const [menu, setMenu] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<any>(null);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [variantToEdit, setVariantToEdit] = useState<any>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // UI Expansion States
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const toggleCategory = (id: string) =>
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));

  const fetchMenuData = async () => {
    setIsLoading(true);
    const response = await callServer("/menu");

    if (!response.success) {
      if (response.status === 404) {
        setMenu(null);
      }
      setIsLoading(false);
      return;
    }

    setMenu(response.data?.data || response.data || null);
    setIsLoading(false);
  };

  useEffect(() => {
    if (restaurant) {
      fetchMenuData();
    }
  }, [restaurant]);

  // Menu Actions
  const handleCreateMenu = async () => {
    setIsLoading(true);
    const response = await callServer("/menu", {
      method: "POST",
    });

    if (response.success) {
      toast.success("Menu created successfully");
      fetchMenuData();
    } else {
      setIsLoading(false);
    }
  };

  const handleDeleteMenu = async () => {
    if (!window.confirm(`Are you sure you want to delete your menu?`)) return;

    const response = await callServer("/menu", {
      method: "DELETE",
    });

    if (response.success) {
      toast.success(`Menu deleted successfully`);
      fetchMenuData();
    }
  };

  const handleToggleMenuStatus = async () => {
    if (!menu) return;
    const response = await callServer("/menu", {
      method: "PATCH",
      data: { isActive: !menu.isActive },
    });

    if (response.success) {
      toast.success(
        `Menu ${menu.isActive ? "deactivated" : "activated"} successfully`,
      );
      fetchMenuData();
    }
  };

  const handleDelete = async (
    endpoint: string,
    id: string,
    entityName: string,
  ) => {
    if (!window.confirm(`Are you sure you want to delete this ${entityName}?`))
      return;

    const response = await callServer(`/menu/${endpoint}/${id}`, {
      method: "DELETE",
    });

    if (response.success) {
      toast.success(`${entityName} deleted successfully`);
      fetchMenuData();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Loading your menu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard
              size={24}
              className="text-blue-600 dark:text-blue-500"
            />
            Menu Management
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Build and manage your restaurant's digital menu.
          </p>
        </div>

        {(!menu || menu.isDeleted) && (
          <button
            onClick={handleCreateMenu}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors active:scale-95"
          >
            <Plus size={18} />
            Create Menu
          </button>
        )}
      </div>

      {/* Main Content */}
      {!menu || menu.isDeleted ? (
        <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
            <Coffee size={32} className="text-blue-600 dark:text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            No Menu Found
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-8">
            Get started by creating your menu. You can add categories, items,
            variants, and add-ons.
          </p>
          <button
            onClick={handleCreateMenu}
            className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            <Plus size={18} />
            Create Menu
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden transition-all">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-5 bg-neutral-50/50 dark:bg-neutral-900/20">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Restaurant Menu
                </h3>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ml-2 ${menu.isActive ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"}`}
                >
                  {menu.isActive ? "Active" : "Inactive"}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                  {menu.categories?.length || 0} Categories
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBulkModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                  title="Bulk Upload JSON"
                >
                  Bulk Add
                </button>
                <button
                  onClick={() => {
                    setCategoryToEdit(null);
                    setIsCategoryModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                >
                  <Plus size={16} /> Add Category
                </button>
                <button
                  onClick={handleToggleMenuStatus}
                  className={`p-1.5 rounded-lg transition-colors ${menu.isActive ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10" : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"}`}
                  title={menu.isActive ? "Deactivate Menu" : "Activate Menu"}
                >
                  <Power size={16} />
                </button>
                <button
                  onClick={handleDeleteMenu}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete Menu"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Categories Container */}
            <div className="p-5 pt-2 space-y-4 border-t border-neutral-100 dark:border-neutral-800">
              {!menu.categories || menu.categories.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 text-sm">
                  No categories yet. Add one to get started.
                </div>
              ) : (
                menu.categories.map((category: any) => (
                  <div
                    key={category.id}
                    className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden"
                  >
                    {/* Category Header */}
                    <div
                      className="flex items-center justify-between p-4 bg-white dark:bg-neutral-950 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <div className="flex items-center gap-3">
                        {expandedCategories[category.id] ? (
                          <ChevronDown size={18} className="text-neutral-400" />
                        ) : (
                          <ChevronRight
                            size={18}
                            className="text-neutral-400"
                          />
                        )}
                        <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {category.name}
                        </h4>
                      </div>
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setSelectedCategoryId(category.id);
                            setItemToEdit(null);
                            setIsItemModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                        >
                          + Item
                        </button>
                        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1"></div>
                        <button
                          onClick={() => {
                            setCategoryToEdit(category);
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-1.5 text-neutral-500 hover:text-blue-600 rounded-lg"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete("categories", category.id, "Category")
                          }
                          className="p-1.5 text-red-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Items Container */}
                    {expandedCategories[category.id] && (
                      <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-t border-neutral-100 dark:border-neutral-800">
                        {/* Items Section */}
                        <div>
                          <h5 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 px-1">
                            Items
                          </h5>
                          {!category.items || category.items.length === 0 ? (
                            <div className="text-sm text-neutral-500 py-2 px-1">
                              No items in this category.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {category.items.map((item: any) => (
                                <div
                                  key={item.id}
                                  className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm"
                                >
                                  <div className="flex items-start justify-between p-4 bg-white dark:bg-neutral-950">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h6 className="font-semibold text-neutral-900 dark:text-white">
                                          {item.name}
                                        </h6>
                                        {!item.isActive && (
                                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-neutral-100 text-neutral-500 rounded-md">
                                            Draft
                                          </span>
                                        )}
                                      </div>
                                      {item.description && (
                                        <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 ml-4">
                                      <button
                                        onClick={() => {
                                          setSelectedItemId(item.id);
                                          setVariantToEdit(null);
                                          setIsVariantModalOpen(true);
                                        }}
                                        className="px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
                                      >
                                        + Variant
                                      </button>
                                      <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1"></div>
                                      <button
                                        onClick={() => {
                                          setItemToEdit(item);
                                          setIsItemModalOpen(true);
                                        }}
                                        className="p-1.5 text-neutral-400 hover:text-blue-500"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDelete("items", item.id, "Item")
                                        }
                                        className="p-1.5 text-neutral-400 hover:text-red-500"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Variants Sub-grid */}
                                  {item.variants &&
                                    item.variants.length > 0 && (
                                      <div className="px-4 pb-4 pt-2 bg-neutral-50/50 dark:bg-neutral-900/30 border-t border-neutral-100 dark:border-neutral-800/50">
                                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                                          Variants
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          {item.variants.map((variant: any) => (
                                            <div
                                              key={variant.id}
                                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                                            >
                                              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                                {variant.name}
                                              </span>
                                              <span className="text-neutral-400 dark:text-neutral-500">
                                                |
                                              </span>
                                              <span className="font-semibold flex items-center text-neutral-900 dark:text-white">
                                                <CurrencyIcon
                                                  size={14}
                                                  className="mr-0.5"
                                                />
                                                {(variant.price / 100).toFixed(
                                                  2,
                                                )}
                                              </span>
                                              <div className="flex ml-1 border-l border-neutral-200 dark:border-neutral-700 pl-1">
                                                <button
                                                  onClick={() => {
                                                    setVariantToEdit(variant);
                                                    setIsVariantModalOpen(true);
                                                  }}
                                                  className="p-1 text-neutral-400 hover:text-blue-600"
                                                >
                                                  <Edit2 size={12} />
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    handleDelete(
                                                      "variants",
                                                      variant.id,
                                                      "Variant",
                                                    )
                                                  }
                                                  className="p-1 text-neutral-400 hover:text-red-500"
                                                >
                                                  <Trash2 size={12} />
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
        menuId={menu?.id}
        onSuccess={fetchMenuData}
      />

      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        itemToEdit={itemToEdit}
        categoryId={selectedCategoryId}
        onSuccess={fetchMenuData}
      />

      <VariantModal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        variantToEdit={variantToEdit}
        itemId={selectedItemId}
        onSuccess={fetchMenuData}
      />

      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        menuId={menu?.id}
        onSuccess={fetchMenuData}
      />
    </div>
  );
}
