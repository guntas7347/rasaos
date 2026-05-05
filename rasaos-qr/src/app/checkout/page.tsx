import { ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { CurrencyIcon } from "../../components/CurrencyIcon";
import { formatCurrency } from "../../lib/currency";

import { callServer } from "../../lib/helpers";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    cartTotal,
    cartCount,
    restaurant,
    tableNumber: appContextTableNumber,
  } = useAppContext();

  const [orderType, setOrderType] = useState("dine-in");
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [tableNumber, setTableNumber] = useState(appContextTableNumber || "");
  const [address, setAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const showtax = restaurant?.taxMode === "EXCLUSIVE";
  const taxAndFees = showtax
    ? (cartTotal * (restaurant?.taxRate || 0)) / 100
    : 0;

  // Calculate specific conditions
  const isDelivery = orderType === "delivery";
  const isDineIn = orderType === "dine-in";

  const isValid =
    cart.length > 0 &&
    mobileNumber.trim() !== "" &&
    ((isDineIn && tableNumber.trim() !== "") ||
      (isDelivery && address.trim() !== "") ||
      (!isDineIn && !isDelivery));

  const handlePlaceOrder = async () => {
    if (!isValid || !restaurant) return;
    setIsSubmitting(true);

    try {
      const payload = {
        restaurantId: restaurant.id,
        type:
          orderType === "dine-in"
            ? "DINE_IN"
            : orderType === "takeaway"
              ? "TAKEAWAY"
              : "DELIVERY",
        customerName: customerName || undefined,
        customerMobile: mobileNumber,
        tableNumber: isDineIn ? tableNumber : undefined,
        customerAddress: isDelivery ? address : undefined,
        note: specialInstructions || undefined,
        items: cart.map((item) => ({
          itemId: item.menuItemId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      };

      const result = await callServer("/order", {
        method: "POST",
        data: payload,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to place order");
      }

      setOrderSuccess(true);
      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    } catch (error) {
      console.error(error);
      // alert("Failed to place order. Please try again."); // Removed alert as callServer already toasts
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center p-8 animate-in zoom-in duration-300">
          <div className="size-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send size={40} className="ml-1" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Your order has been sent to the kitchen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-76px)] w-full flex-col max-w-[480px] mx-auto bg-background-light dark:bg-background-dark shadow-xl overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md p-4 border-b border-primary/10">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
          Checkout
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Order Summary Preview */}
        <div className="px-4 pt-6 pb-2">
          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Order from
              </span>
              <span className="text-sm font-bold text-primary">
                The Golden Fork
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold">
                <CurrencyIcon />
                {formatCurrency(cartTotal + taxAndFees)}
              </span>
              <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-1 rounded-full">
                {cartCount} Items
              </span>
            </div>
          </div>
        </div>

        {/* Order Type Selection */}
        <div className="px-4 pt-6">
          <h3 className="text-base font-bold leading-tight tracking-tight pb-3">
            Order Type
          </h3>
          <div className="flex bg-slate-200/50 dark:bg-slate-800/50 rounded-xl p-1.5 gap-1">
            <label className="flex cursor-pointer h-10 flex-1 items-center justify-center overflow-hidden rounded-lg transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm has-[:checked]:text-primary text-slate-500 dark:text-slate-400 text-sm font-semibold">
              <span className="truncate">Dine-in</span>
              <input
                type="radio"
                name="order-type"
                value="dine-in"
                className="sr-only"
                checked={orderType === "dine-in"}
                onChange={() => setOrderType("dine-in")}
              />
            </label>
            <label className="flex cursor-pointer h-10 flex-1 items-center justify-center overflow-hidden rounded-lg transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm has-[:checked]:text-primary text-slate-500 dark:text-slate-400 text-sm font-semibold">
              <span className="truncate">Takeaway</span>
              <input
                type="radio"
                name="order-type"
                value="takeaway"
                className="sr-only"
                checked={orderType === "takeaway"}
                onChange={() => setOrderType("takeaway")}
              />
            </label>
            <label className="flex cursor-pointer h-10 flex-1 items-center justify-center overflow-hidden rounded-lg transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm has-[:checked]:text-primary text-slate-500 dark:text-slate-400 text-sm font-semibold">
              <span className="truncate">Delivery</span>
              <input
                type="radio"
                name="order-type"
                value="delivery"
                className="sr-only"
                checked={orderType === "delivery"}
                onChange={() => setOrderType("delivery")}
              />
            </label>
          </div>
        </div>

        {/* Customer Details */}
        <div className="px-4 pt-6 space-y-5">
          {/* Customer Name */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center pb-2">
              <label className="text-sm font-semibold">Name</label>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Optional
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-14 pl-4 pr-4 text-base font-normal transition-all"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center pb-2">
              <label className="text-sm font-semibold">Mobile Number</label>
              <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
                Required
              </span>
            </div>
            <div className="relative">
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-14 pl-4 pr-4 text-base font-normal transition-all"
              />
            </div>
          </div>

          {/* Table Number (Shown for Dine-in) */}
          {isDineIn && (
            <div className="flex flex-col animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center pb-2">
                <label className="text-sm font-semibold">Table Number</label>
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
                  Required
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g. 12"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-14 pl-4 pr-4 text-base font-normal transition-all"
                />
              </div>
            </div>
          )}

          {/* Delivery Address (Shown for Delivery) */}
          {isDelivery && (
            <div className="flex flex-col animate-in fade-in slide-in-from-top-2 space-y-3">
              <div className="flex justify-between items-center pb-2">
                <label className="text-sm font-semibold">
                  Delivery Address
                </label>
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
                  Required
                </span>
              </div>
              <div className="relative">
                <textarea
                  rows={3}
                  placeholder="Enter your full street address, apartment, or suite number"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-base font-normal transition-all resize-none"
                ></textarea>
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold pb-2">
              Special Instructions
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Allergies, door codes, or specific requests..."
              className="flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-normal transition-all resize-none"
            ></textarea>
          </div>
        </div>

        {/* Total Section */}
        <div className="px-4 py-8 border-t border-slate-100 dark:border-slate-800 mt-8 space-y-3">
          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span>
              <CurrencyIcon />
              {formatCurrency(cartTotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>Tax &amp; Fees</span>
            <span>
              <CurrencyIcon />
              {formatCurrency(taxAndFees)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2">
            <span>Total Amount</span>
            <span>
              <CurrencyIcon />
              {formatCurrency(cartTotal + taxAndFees)}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Footer with Primary Action */}
      <div className="fixed bottom-[76px] left-0 right-0 max-w-[480px] mx-auto p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 z-10">
        <button
          onClick={handlePlaceOrder}
          disabled={!isValid || isSubmitting}
          className={`w-full h-14 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            isValid
              ? "bg-primary text-white active:scale-[0.98] shadow-lg shadow-primary/20 cursor-pointer"
              : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
          }`}
        >
          <span>{isSubmitting ? "Processing..." : "Place Order"}</span>
          {!isSubmitting && <Send size={18} />}
        </button>
        {!isValid && (
          <p className="text-[10px] text-center text-slate-400 mt-2 uppercase tracking-widest font-bold">
            Please fill all required fields
          </p>
        )}
      </div>
    </div>
  );
}
