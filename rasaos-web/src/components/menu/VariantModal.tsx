import React, { useState, useEffect } from "react";
import { BaseModal } from "../ui/BaseModal";
import toast from "react-hot-toast";
import { callServer } from "../../lib/helpers";

interface VariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  variantToEdit?: any;
  itemId: string | null;
  onSuccess: () => void;
}

export function VariantModal({
  isOpen,
  onClose,
  variantToEdit,
  itemId,
  onSuccess,
}: VariantModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (variantToEdit) {
      setName(variantToEdit.name || "");
      setPrice(variantToEdit.price || "");
    } else {
      setName("");
      setPrice("");
    }
  }, [variantToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId && !variantToEdit) {
      toast.error("Item ID is missing");
      return;
    }

    if (price === "" || price < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsLoading(true);

    const isEditing = !!variantToEdit;
    const url = isEditing
      ? `/menu/variants/${variantToEdit.id}`
      : `/menu/variants`;

    const method = isEditing ? "PATCH" : "POST";
    const payload = isEditing
      ? { name, price: Number(price) }
      : { itemId, name, price: Number(price) };

    const response = await callServer(url, {
      method,
      data: payload,
    });

    if (response.success) {
      toast.success(response.message || "Success");
      onSuccess();
      onClose();
    }

    setIsLoading(false);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={variantToEdit ? "Edit Variant" : "Add Variant"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Variant Name
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Large, 12-inch, Spicy"
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Price (in cents/base unit)
          </label>
          <input
            type="number"
            required
            min={0}
            value={price}
            onChange={(e) =>
              setPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="e.g. 1500 for 15.00"
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
            disabled={isLoading || !name.trim() || price === ""}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : variantToEdit ? (
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
