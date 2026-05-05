import React, { useState, useEffect } from "react";
import { BaseModal } from "../ui/BaseModal";
import toast from "react-hot-toast";
import { callServer } from "../../lib/helpers";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: any;
  categoryId: string | null;
  onSuccess: () => void;
}

export function ItemModal({
  isOpen,
  onClose,
  itemToEdit,
  categoryId,
  onSuccess,
}: ItemModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name || "");
      setDescription(itemToEdit.description || "");
      setImageUrl(itemToEdit.imageUrl || "");
      setIsActive(itemToEdit.isActive !== false);
    } else {
      setName("");
      setDescription("");
      setImageUrl("");
      setIsActive(true);
    }
  }, [itemToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId && !itemToEdit) {
      toast.error("Category ID is missing");
      return;
    }

    setIsLoading(true);

    const isEditing = !!itemToEdit;
    const url = isEditing
      ? `/menu/items/${itemToEdit.id}`
      : `/menu/items`;

    const method = isEditing ? "PATCH" : "POST";
    const payload = isEditing
      ? { name, description, imageUrl, isActive }
      : { categoryId, name, description, imageUrl };

    const response = await callServer(url, {
      method,
      data: payload,
    });

    if (response.success) {
      toast.success(`Item ${isEditing ? "updated" : "created"} successfully!`);
      onSuccess();
      onClose();
    }

    setIsLoading(false);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={itemToEdit ? "Edit Item" : "Add Item"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Item Name
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Margherita Pizza"
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe the item..."
            rows={3}
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
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

        {itemToEdit && (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Active (Visible on Menu)
            </label>
          </div>
        )}

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
            ) : itemToEdit ? (
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
