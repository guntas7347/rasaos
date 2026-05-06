import { ChevronLeft, Plus, Minus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { CurrencyIcon } from "../../components/CurrencyIcon";
import { formatCurrency } from "../../lib/currency";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, updateQuantity, removeFromCart, restaurant } =
    useAppContext();

  const showtax = restaurant?.taxMode === "EXCLUSIVE";
  const tax = (cartTotal * (restaurant?.taxRate || 0)) / 100;
  const finalTotal = showtax ? cartTotal + tax : cartTotal;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex size-10 items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-800/50"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Your Cart</h1>
          <button
            onClick={() => cart.forEach((item) => removeFromCart(item.id))}
            className="text-sm font-semibold text-primary"
          >
            Clear
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 space-y-6 pt-4 pb-32">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-60">
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => {
              // Get original item image
              const { menuItems } = useAppContext();
              const menuItem = menuItems.find((m) => m.id === item.menuItemId);
              const image =
                menuItem?.imageUrl || "https://via.placeholder.com/150";

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-white dark:bg-slate-900/40 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800"
                >
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-20 shrink-0"
                    style={{ backgroundImage: `url('${image}')` }}
                  ></div>
                  <div className="flex flex-col flex-1 justify-between py-1">
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 text-base font-bold leading-tight">
                        {item.name}
                      </p>
                      {/* Custom properties mapped from AppContext cart schema */}
                      <div className="flex flex-col gap-0.5 mt-1">
                        {item.variantName && (
                          <p className="text-slate-500 dark:text-slate-400 text-xs">
                            Variant: {item.variantName}
                          </p>
                        )}
                        {item.selectedAddons &&
                          item.selectedAddons.length > 0 && (
                            <p className="text-slate-400 dark:text-slate-500 text-[10px]">
                              +{" "}
                              {item.selectedAddons
                                .map((a) => a.name)
                                .join(", ")}
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-primary text-base font-bold">
                        <CurrencyIcon />
                        {formatCurrency(item.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="size-6 flex items-center justify-center rounded-full bg-white dark:bg-slate-700 shadow-sm"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="size-6 flex items-center justify-center rounded-full bg-primary text-white shadow-sm"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Totals Section */}
        {cart.length > 0 && (
          <div className="pt-4 pb-8 space-y-3">
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <p className="text-sm">Subtotal</p>
              <p className="text-sm font-medium">
                <CurrencyIcon />
                {formatCurrency(cartTotal)}
              </p>
            </div>
            {showtax && (
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <p className="text-sm"> Tax ({restaurant?.taxRate}%)</p>
                <p className="text-sm font-medium">
                  <CurrencyIcon />
                  {formatCurrency(tax)}
                </p>
              </div>
            )}

            <div className="h-px bg-slate-200 dark:bg-slate-800 my-2"></div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold">Total</p>
              <p className="text-2xl font-bold text-primary">
                <CurrencyIcon />
                {formatCurrency(finalTotal)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Footer relative to container (bottom nav manages absolute bottom) */}
      {cart.length > 0 && (
        <div className="fixed bottom-[76px] left-1/2 -translate-x-1/2 w-full max-w-md z-30">
          <div className="bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 p-4 relative top-2">
            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
            >
              Proceed to Checkout
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
