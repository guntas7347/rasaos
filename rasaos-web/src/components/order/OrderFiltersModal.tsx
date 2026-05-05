import { useState, useEffect } from "react";
import { BaseModal } from "../ui/BaseModal";

interface OrderFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateFilter: string;
  orderIdFilter: string;
  onApplyFilters: (date: string, orderId: string) => void;
}

export function OrderFiltersModal({
  isOpen,
  onClose,
  dateFilter,
  orderIdFilter,
  onApplyFilters,
}: OrderFiltersModalProps) {
  const [localDate, setLocalDate] = useState(dateFilter);
  const [localId, setLocalId] = useState(orderIdFilter);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalDate(dateFilter);
      setLocalId(orderIdFilter);
    }
  }, [isOpen, dateFilter, orderIdFilter]);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Filter Orders">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Date
          </label>
          <input
            type="date"
            className="w-full h-10 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            value={localDate}
            onChange={(e) => setLocalDate(e.target.value)}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Viewing all records for the selected date.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Order ID (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. d3dd4e93"
            className="w-full h-10 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            value={localId}
            onChange={(e) => setLocalId(e.target.value)}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 mt-6 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => {
              setLocalDate("");
              setLocalId("");
              onApplyFilters("", "");
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => {
              onApplyFilters(localDate, localId);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
