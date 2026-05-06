import React from "react";

interface OrderReceiptProps {
  order: any;
  restaurantName: string;
}

export const OrderReceipt = React.forwardRef<HTMLDivElement, OrderReceiptProps>(
  ({ order, restaurantName }, ref) => {
    if (!order) return null;

    const date = new Date(order.createdAt).toLocaleString();

    return (
      <div
        ref={ref}
        className="bg-white text-black"
        style={{
          width: "80mm",
          padding: "10px",
          margin: "0 auto",
          fontFamily: "monospace",
          fontSize: "12px",
        }}
      >
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold uppercase">{restaurantName}</h2>
          <p className="text-xs mt-1">{date}</p>
          <p className="text-xs">Order #{order.id?.slice(0, 8)}</p>
          <div className="mt-2 text-sm font-bold uppercase border-b border-black border-dashed pb-2">
            {order.type?.replace("_", " ")}
            {order.tableNumber && ` - TABLE ${order.tableNumber}`}
          </div>
        </div>

        {/* Customer Details */}
        {(order.customerName || order.customerMobile) && (
          <div className="mb-4 text-xs border-b border-black border-dashed pb-2">
            {order.customerName && (
              <p>
                <strong>Customer:</strong> {order.customerName}
              </p>
            )}
            {order.customerMobile && (
              <p>
                <strong>Contact:</strong> {order.customerMobile}
              </p>
            )}
          </div>
        )}

        <div className="mb-2 font-bold flex justify-between border-b border-black border-dashed pb-1">
          <span>Item</span>
          <span>Amt</span>
        </div>

        <div className="space-y-1 mb-4">
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between text-xs">
              <div className="flex gap-1 w-full pr-4">
                <span className="font-bold">{item.quantity}x</span>
                <span className="break-words block">
                  {item.itemName}
                  {item.variantName && (
                    <span className="block text-[10px] text-gray-600 mt-0.5">
                      ({item.variantName})
                    </span>
                  )}
                </span>
              </div>
              <span className="shrink-0">
                {((item.unitPrice * item.quantity) / 100).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-black border-dashed pt-2 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              {(
                (order.pricingBreakdown?.subtotal || order.subtotal) / 100
              ).toFixed(2)}
            </span>
          </div>

          {order.pricingBreakdown?.discounts?.length > 0 &&
            order.pricingBreakdown.discounts.map((d: any, i: number) => (
              <div key={`d-${i}`} className="flex justify-between">
                <span>{d.label || d.type}</span>
                <span>-{(Math.abs(d.appliedAmount) / 100).toFixed(2)}</span>
              </div>
            ))}

          {order.pricingBreakdown?.charges?.length > 0 &&
            order.pricingBreakdown.charges.map((c: any, i: number) => (
              <div key={`c-${i}`} className="flex justify-between">
                <span>{c.label}</span>
                <span>+{(c.appliedAmount / 100).toFixed(2)}</span>
              </div>
            ))}

          {order.pricingBreakdown?.taxes?.length > 0 &&
            order.pricingBreakdown.taxes.map((t: any, i: number) => (
              <div key={`t-${i}`} className="flex justify-between">
                <span>{t.label}</span>
                <span>+{(t.appliedAmount / 100).toFixed(2)}</span>
              </div>
            ))}
        </div>

        <div className="border-t border-black border-dashed mt-2 pt-2 flex justify-between items-center text-sm font-bold">
          <span>TOTAL</span>
          <span>{(order.totalAmount / 100).toFixed(2)}</span>
        </div>

        {order.payment && (
          <div className="mt-4 text-center text-xs uppercase font-bold">
            Paid via {order.payment.provider}
          </div>
        )}

        <div className="mt-6 text-center text-xs">
          <p>Thank you!</p>
        </div>
      </div>
    );
  },
);

OrderReceipt.displayName = "OrderReceipt";
