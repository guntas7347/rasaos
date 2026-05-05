import { Clock, Box, Tag, CreditCard } from "lucide-react";
import { CurrencyIcon } from "../ui/CurrencyIcon";
import { getStatusColor } from "./utils";

export function OrderCard({
  order,
  onClick,
}: {
  order: any;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer"
    >
      {/* Order Header */}
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between bg-neutral-50/50 dark:bg-neutral-900/20">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
              #{order.id.slice(0, 8)}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(
                order.status,
              )}`}
            >
              {order.status}
            </span>
            {order.type && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400">
                {order.type.replace("_", " ")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            <Clock size={12} />
            {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-neutral-900 dark:text-white flex items-center justify-end">
            <CurrencyIcon size={18} className="mr-0.5" />
            {(order.totalAmount / 100).toFixed(2)}
          </div>
          {order.payment && (
            <div className="flex items-center justify-end gap-1 text-[10px] font-semibold text-neutral-500 uppercase mt-0.5">
              <CreditCard size={10} />
              {order.payment.provider}
            </div>
          )}
        </div>
      </div>

      {/* Order Items Summary */}
      <div className="p-4 flex-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
          <Box size={14} /> Items ({order.items?.length || 0})
        </h4>

        <div className="space-y-3">
          {Array.isArray(order.items) &&
            order.items.slice(0, 3).map((item: any) => (
              <div
                key={item.id}
                className="flex items-start justify-between text-sm"
              >
                <div className="flex relative">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300 w-5 tabular-nums text-right shrink-0">
                    {item.quantity}
                  </span>
                  <span className="mx-2 text-neutral-300 dark:text-neutral-700">
                    x
                  </span>
                  <span
                    className="font-medium text-neutral-800 dark:text-neutral-200 line-clamp-1 break-all pr-2"
                    title={item.variantName}
                  >
                    {item.variantName}
                  </span>
                </div>
                <span className="font-medium text-neutral-600 dark:text-neutral-400 shrink-0 flex items-center">
                  <CurrencyIcon size={14} className="mr-0.5" />
                  {((item.variantPrice * item.quantity) / 100).toFixed(2)}
                </span>
              </div>
            ))}
          {Array.isArray(order.items) && order.items.length > 3 && (
            <div className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer text-center pt-2">
              + {order.items.length - 3} more items...
            </div>
          )}
        </div>
      </div>

      {/* Footer / Pricing Breakdown Line */}
      {order.pricingBreakdown && (
        <div className="p-3 bg-neutral-50/50 dark:bg-neutral-900/40 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 font-medium flex flex-col gap-1.5 mt-auto">
          {order.pricingBreakdown.discounts?.length > 0 && (
            <div className="flex justify-between text-amber-600 dark:text-amber-500">
              <span className="flex items-center gap-1">
                <Tag size={12} /> Discounts
              </span>
              <span className="flex items-center">
                -<CurrencyIcon size={10} className="mx-0.5" />
                {(
                  Math.abs(
                    order.pricingBreakdown.discounts.reduce(
                      (a: any, b: any) => a + b.appliedAmount,
                      0,
                    ),
                  ) / 100
                ).toFixed(2)}
              </span>
            </div>
          )}
          {order.pricingBreakdown.charges?.length > 0 && (
            <div className="flex justify-between">
              <span>Charges</span>
              <span className="flex items-center">
                +<CurrencyIcon size={10} className="mx-0.5" />
                {(
                  order.pricingBreakdown.charges.reduce(
                    (a: any, b: any) => a + b.appliedAmount,
                    0,
                  ) / 100
                ).toFixed(2)}
              </span>
            </div>
          )}
          {order.pricingBreakdown.taxes?.length > 0 && (
            <div className="flex justify-between">
              <span>Taxes</span>
              <span className="flex items-center">
                +<CurrencyIcon size={10} className="mx-0.5" />
                {(
                  order.pricingBreakdown.taxes.reduce(
                    (a: any, b: any) => a + b.appliedAmount,
                    0,
                  ) / 100
                ).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
