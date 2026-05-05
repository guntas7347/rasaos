import React, { useState, useEffect } from "react";
import { BaseModal } from "../ui/BaseModal";
import toast from "react-hot-toast";
import { callServer } from "../../lib/helpers";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: any;
  menuId: string | null;
  onSuccess: () => void;
}

export function CategoryModal({
  isOpen,
  onClose,
  categoryToEdit,
  menuId,
  onSuccess,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || "");
      setOrder(categoryToEdit.order || 0);
      setImageUrl(categoryToEdit.imageUrl || "");
    } else {
      setName("");
      setOrder(0);
      setImageUrl("");
    }
  }, [categoryToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuId && !categoryToEdit) {
      toast.error("Menu ID is missing");
      return;
    }

    setIsLoading(true);

    const isEditing = !!categoryToEdit;
    const url = isEditing
      ? `/menu/categories/${categoryToEdit.id}`
      : `/menu/categories`;

    const method = isEditing ? "PATCH" : "POST";
    const payload = isEditing
      ? { name, order: Number(order), imageUrl }
      : { menuId, name, order: Number(order), imageUrl };

    const response = await callServer(url, {
      method,
      data: payload,
    });

    if (response.success) {
      toast.success(
        `Category ${isEditing ? "updated" : "created"} successfully!`,
      );
      onSuccess();
      onClose();
    }

    setIsLoading(false);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? "Edit Category" : "Add Category"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Category Name
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Starters"
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Display Order
          </label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            placeholder="0"
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Image URL (Optional)
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : categoryToEdit ? (
              "Save Changes"
            ) : (
              "Create"
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
