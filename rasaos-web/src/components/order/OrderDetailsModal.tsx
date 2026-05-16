import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, CreditCard, Trash2, Phone, Tag } from "lucide-react";
import { BaseModal } from "../ui/BaseModal";
import { CurrencyIcon } from "../ui/CurrencyIcon";
import { getStatusColor } from "./utils";
import { OrderReceipt } from "./OrderReceipt";
import { useAuth } from "../../contexts/AuthContext";

export function OrderDetailsModal({
  isOpen,
  onClose,
  selectedOrder,
  updateOrderStatus,
  deleteOrder,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: any;
  updateOrderStatus: (id: string, updates: any) => Promise<void> | void;
  deleteOrder: (id: string) => Promise<void> | void;
}) {
  const { restaurant } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  } as any);

  if (!selectedOrder) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details #${selectedOrder?.id?.slice(0, 8) || ""}`}
    >
      <div className="space-y-6">
        {/* Action Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Update Status
              </label>
              <div className="flex gap-2">
                <select
                  className="h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={selectedOrder.status}
                  onChange={(e) =>
                    updateOrderStatus(selectedOrder.clientOrderId, {
                      status: e.target.value,
                    })
                  }
                >
                  <option value="PENDING">Pending</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="READY">Ready</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-auto">
            <button
              title="Print Order"
              onClick={() => handlePrint()}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
            >
              <Printer size={18} />
            </button>

            <button
              title="Change Payment Status"
              onClick={() =>
                updateOrderStatus(selectedOrder.id, {
                  paymentStatus:
                    selectedOrder.payment?.status === "COMPLETED"
                      ? "PENDING"
                      : "COMPLETED",
                })
              }
              className="flex items-center gap-2 px-3 h-9 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
            >
              <CreditCard size={16} />
              <span>
                {selectedOrder.payment?.status === "COMPLETED"
                  ? "Mark Unpaid"
                  : "Mark Paid"}
              </span>
            </button>

            <button
              title="Delete Order"
              onClick={() => deleteOrder(selectedOrder.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-100 dark:border-red-900/30"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Customer Details - Conditional Rendering */}
        {(selectedOrder.customerName ||
          selectedOrder.customerMobile ||
          selectedOrder.customerAddress ||
          selectedOrder.note ||
          selectedOrder.tableNumber) && (
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/30 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-2">
            {selectedOrder.customerName && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider min-w-[140px]">
                  Customer
                </span>
                <span className="text-sm font-semibold text-neutral-900 dark:text-white text-right">
                  {selectedOrder.customerName}
                </span>
              </div>
            )}
            {selectedOrder.customerMobile && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider min-w-[140px]">
                  Contact
                </span>
                <span className="text-sm text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Phone size={12} className="text-neutral-400" />
                  {selectedOrder.customerMobile}
                </span>
              </div>
            )}
            {selectedOrder.customerAddress && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider min-w-[140px]">
                  Shipping Address
                </span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 text-right leading-relaxed">
                  {selectedOrder.customerAddress}
                </span>
              </div>
            )}
            {selectedOrder.note && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider min-w-[140px]">
                  Special Instructions
                </span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 text-right leading-relaxed">
                  {selectedOrder.note}
                </span>
              </div>
            )}{" "}
            {selectedOrder.tableNumber && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider min-w-[140px]">
                  Table
                </span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 text-right leading-relaxed">
                  {selectedOrder.tableNumber}
                </span>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Status & Type
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div
                className={`inline-flex text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(
                  selectedOrder.status,
                )}`}
              >
                {selectedOrder.status}
              </div>
              {selectedOrder.type && (
                <div className="inline-flex text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400">
                  {selectedOrder.type.replace("_", " ")}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Date & Time
            </div>
            <div className="text-sm font-medium text-neutral-900 dark:text-white mt-1">
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">
            Items
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {Array.isArray(selectedOrder.items) &&
              selectedOrder.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm py-2 border-b border-neutral-100 dark:border-neutral-800/50 last:border-0"
                >
                  <div className="flex">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300 w-6 tabular-nums">
                      {item.quantity}x
                    </span>
                    <span className="font-medium text-neutral-900 dark:text-white max-w-[200px] break-words">
                      {item.itemName}
                      {item.variantName && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal block mt-0.5">
                          Variant: {item.variantName}
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="font-medium text-neutral-900 dark:text-white shrink-0 flex items-center">
                    <CurrencyIcon size={14} className="mr-0.5" />
                    {((item.unitPrice * item.quantity) / 100).toFixed(2)}{" "}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">
              Subtotal
            </span>
            <span className="font-medium text-neutral-900 dark:text-white flex items-center">
              <CurrencyIcon size={14} className="mr-0.5" />
              {(
                (selectedOrder.pricingBreakdown?.subtotal ||
                  selectedOrder.subtotal) / 100
              ).toFixed(2)}
            </span>
          </div>

          {selectedOrder.pricingBreakdown?.discounts?.length > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-amber-600 dark:text-amber-500 flex items-center gap-1">
                  <Tag size={12} /> Discounts
                </span>
                <span className="font-medium text-amber-600 dark:text-amber-500 flex items-center">
                  -<CurrencyIcon size={14} className="mx-0.5" />
                  {(
                    Math.abs(
                      selectedOrder.pricingBreakdown.discounts.reduce(
                        (a: any, b: any) => a + b.appliedAmount,
                        0,
                      ),
                    ) / 100
                  ).toFixed(2)}
                </span>
              </div>
              <div className="pl-5 space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {selectedOrder.pricingBreakdown.discounts.map(
                  (d: any, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <span className="mr-1">•</span> {d.label || d.type}
                      </div>
                      <div className="flex items-center">
                        -<CurrencyIcon size={10} className="mx-0.5" />
                        {(Math.abs(d.appliedAmount) / 100).toFixed(2)}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {selectedOrder.pricingBreakdown?.charges?.length > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Charges
                </span>
                <span className="font-medium flex items-center text-neutral-900 dark:text-white">
                  +<CurrencyIcon size={14} className="mx-0.5" />
                  {(
                    selectedOrder.pricingBreakdown.charges.reduce(
                      (a: any, b: any) => a + b.appliedAmount,
                      0,
                    ) / 100
                  ).toFixed(2)}
                </span>
              </div>
              <div className="pl-5 space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {selectedOrder.pricingBreakdown.charges.map(
                  (c: any, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <span className="mr-1">•</span> {c.label}
                      </div>
                      <div className="flex items-center">
                        +<CurrencyIcon size={10} className="mx-0.5" />
                        {(c.appliedAmount / 100).toFixed(2)}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {selectedOrder.pricingBreakdown?.taxes?.length > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Taxes
                </span>
                <span className="font-medium flex items-center text-neutral-900 dark:text-white">
                  +<CurrencyIcon size={14} className="mx-0.5" />
                  {(
                    selectedOrder.pricingBreakdown.taxes.reduce(
                      (a: any, b: any) => a + b.appliedAmount,
                      0,
                    ) / 100
                  ).toFixed(2)}
                </span>
              </div>
              <div className="pl-5 space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {selectedOrder.pricingBreakdown.taxes.map(
                  (t: any, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <span className="mr-1">•</span> {t.label}
                      </div>
                      <div className="flex items-center">
                        +<CurrencyIcon size={10} className="mx-0.5" />
                        {(t.appliedAmount / 100).toFixed(2)}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-lg font-bold text-neutral-900 dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <span>Total</span>
            <span className="flex items-center">
              <CurrencyIcon size={18} className="mr-0.5" />
              {((selectedOrder.totalAmount || 0) / 100).toFixed(2)}{" "}
            </span>
          </div>
        </div>

        {selectedOrder.payment && (
          <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg font-medium">
            <CreditCard size={16} />
            Paid via {selectedOrder.payment.provider} (
            {selectedOrder.payment.status})
          </div>
        )}
      </div>

      <div className="hidden">
        <OrderReceipt
          ref={printRef}
          order={selectedOrder}
          restaurantName={restaurant?.name || "Restaurant"}
        />
      </div>
    </BaseModal>
  );
}
