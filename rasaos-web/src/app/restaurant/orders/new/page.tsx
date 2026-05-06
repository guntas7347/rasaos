"use client";

import { useState, useMemo } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Percent,
  Loader2,
  ChevronRight,
  Check,
} from "lucide-react";
import { CurrencyIcon } from "../../../../components/ui/CurrencyIcon";
import { OrderService } from "../../../../lib/dexie/order-service";
import { SyncService } from "../../../../lib/dexie/sync-service";

export type AdjustmentType = "DISCOUNT" | "FEE" | "SURCHARGE";
export type AdjustmentMode = "FIXED" | "PERCENTAGE";

export interface Adjustment {
  id: string; // internal id for rendering
  label: string;
  type: AdjustmentType;
  mode: AdjustmentMode;
  value: number;
}

export interface CartItem {
  id: string; // internal cart item id
  itemId: string;
  itemName: string;
  variantId?: string;
  variantName?: string;
  price: number;
  quantity: number;
}

export default function CreateOrderPage() {
  const { menu } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [isAddingAdjustment, setIsAddingAdjustment] = useState(false);
  const [newAdjustment, setNewAdjustment] = useState<{
    label: string;
    type: AdjustmentType;
    mode: AdjustmentMode;
    value: string;
  }>({
    label: "Discount",
    type: "DISCOUNT",
    mode: "FIXED",
    value: "",
  });

  // Selection State
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Cart Operations
  const handleAddItem = (item: any, variant?: any) => {
    const existingItem = cartItems.find(
      (c) => c.itemId === item.id && c.variantId === variant?.id,
    );

    if (existingItem) {
      setCartItems(
        cartItems.map((c) =>
          c.id === existingItem.id ? { ...c, quantity: c.quantity + 1 } : c,
        ),
      );
    } else {
      const newItem: CartItem = {
        id: Math.random().toString(36).substring(7),
        itemId: item.id,
        itemName: item.name,
        variantId: variant?.id,
        variantName: variant?.name,
        price: variant ? variant.price : item.price || 0,
        quantity: 1,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    );
  };

  const updateItemPrice = (id: string, newPriceCents: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, price: newPriceCents } : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handleAddAdjustmentSubmit = () => {
    const val = parseFloat(newAdjustment.value);
    if (!newAdjustment.label) {
      toast.error("Label is required");
      return;
    }
    if (isNaN(val) || val <= 0) {
      toast.error("Valid positive number is required");
      return;
    }
    if (newAdjustment.mode === "PERCENTAGE" && val > 100) {
      toast.error("Percentage cannot exceed 100%");
      return;
    }

    setAdjustments([
      ...adjustments,
      {
        id: Math.random().toString(36).substring(7),
        label: newAdjustment.label,
        type: newAdjustment.type,
        mode: newAdjustment.mode,
        value: val,
      },
    ]);
    setIsAddingAdjustment(false);
    setNewAdjustment({ label: "", type: "DISCOUNT", mode: "FIXED", value: "" });
  };

  const removeAdjustment = (id: string) => {
    setAdjustments(adjustments.filter((d) => d.id !== id));
  };

  // Calculations
  const { subtotal, adjustmentTotal, finalTotal } = useMemo(() => {
    const sub = cartItems.reduce((acc, item) => {
      const itemTotal = item.price;
      return acc + itemTotal * item.quantity;
    }, 0);

    let currentLumpSum = sub;
    let netAdjustmentAmount = 0; // Negative means discount, positive means surcharge

    // Apply adjustments
    adjustments.forEach((adj) => {
      let adjAmount = 0;
      if (adj.mode === "FIXED") {
        adjAmount = adj.value * 100; // Assuming price is in cents
      } else if (adj.mode === "PERCENTAGE") {
        adjAmount = (currentLumpSum * adj.value) / 100;
      }

      if (adj.type === "DISCOUNT") {
        if (adjAmount > currentLumpSum) adjAmount = currentLumpSum;
        netAdjustmentAmount -= adjAmount;
        currentLumpSum -= adjAmount;
      } else {
        // FEE or SURCHARGE
        netAdjustmentAmount += adjAmount;
        currentLumpSum += adjAmount;
      }
    });

    return {
      subtotal: sub,
      adjustmentTotal: netAdjustmentAmount,
      finalTotal: sub + netAdjustmentAmount,
    };
  }, [cartItems, adjustments]);

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) return toast.error("Cart is empty");

    const clientOrderId = uuid();
    const orderPayload = {
      clientOrderId,
      type: "DINE_IN",
      items: cartItems.map((i) => ({ ...i, unitPrice: i.price })),
      adjustments: adjustments.map((a) => ({
        ...a,
        value: a.mode === "FIXED" ? a.value * 100 : a.value,
      })),
    };

    try {
      setIsSubmitting(true);

      // 1. Save Locally (Immediate)
      await OrderService.saveNewOrder(orderPayload);

      // 2. Clear UI Immediately
      toast.success("Order saved locally");
      setCartItems([]);
      setAdjustments([]);

      // 3. Trigger Sync (Background)
      // We don't 'await' this if we want true local-first responsiveness
      SyncService.syncOrder(clientOrderId);
    } catch (err) {
      toast.error("Critical error saving order locally");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] -m-4 sm:-m-6 lg:-m-8">
      {/* Left Menu Section */}
      <div className="flex-1 flex flex-col bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-48 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
            {menu?.categories?.map((category: any) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`w-full flex items-center justify-between p-4 text-left text-sm font-medium transition-colors border-b border-neutral-100 dark:border-neutral-800/50 ${
                  selectedCategory?.id === category.id
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-l-blue-600"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                }`}
              >
                {category.name}
                {selectedCategory?.id === category.id && (
                  <ChevronRight size={16} />
                )}
              </button>
            ))}
            {!menu?.categories?.length && (
              <div className="p-4 text-sm text-neutral-500 text-center">
                No categories
              </div>
            )}
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-50/50 dark:bg-neutral-900/50">
            {selectedCategory ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {selectedCategory.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all flex flex-col"
                  >
                    <div className="p-4 flex-1">
                      <h4 className="font-bold text-neutral-900 dark:text-white leading-tight">
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Only show raw price if it has no variants or needs to be selected directly. */}
                      {(!item.variants || item.variants.length === 0) && (
                        <div className="mt-3 font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.price ? (
                            <span className="flex items-center">
                              <CurrencyIcon size={16} className="mr-0.5" />
                              {(item.price / 100).toFixed(2)}
                            </span>
                          ) : (
                            "Price Custom"
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
                      {item.variants && item.variants.length > 0 ? (
                        <div className="space-y-2">
                          {/* Quick variant selection */}
                          <div className="flex flex-wrap gap-2">
                            {item.variants.map((variant: any) => (
                              <button
                                key={variant.id}
                                onClick={() => handleAddItem(item, variant)}
                                className="flex-1 min-w-[100px] flex flex-col items-center justify-center p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors active:scale-95"
                              >
                                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                  {variant.name}
                                </span>
                                <span className="text-sm flex justify-center items-center font-bold text-neutral-900 dark:text-white mt-0.5">
                                  <CurrencyIcon size={14} className="mr-0.5" />
                                  {(variant.price / 100).toFixed(2)}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddItem(item)}
                          className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors active:scale-95"
                        >
                          <Plus size={16} /> Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {(!selectedCategory.items ||
                  selectedCategory.items.length === 0) && (
                  <div className="col-span-full py-12 text-center text-neutral-500">
                    No items in this category
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-500">
                Select a category to view items
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Cart Section */}
      <div className="w-96 flex flex-col bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 shrink-0 shadow-lg z-10 overflow-hidden">
        {/* Cart Header (Fixed) */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50 dark:bg-neutral-900/50">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <ShoppingCart size={20} className="text-blue-600" />
            Current Order
          </h2>
          <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded-full">
            {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
          </span>
        </div>

        {/* Scrollable Container for Items + Discounts + Totals */}
        <div className="flex-1 overflow-y-auto w-full">
          {/* Cart Items */}
          <div className="p-4 space-y-3 min-h-[300px]">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4 pt-12">
                <ShoppingCart size={48} className="opacity-20" />
                <p className="text-sm font-medium">Your cart is empty</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col gap-2 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                        {item.itemName}
                      </h5>
                      {item.variantName && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {item.variantName}
                        </p>
                      )}
                      <div className="text-sm font-semibold text-neutral-900 dark:text-white mt-1 flex items-center">
                        <CurrencyIcon size={16} className="mr-0.5" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price / 100}
                          onChange={(e) =>
                            updateItemPrice(
                              item.id,
                              Math.round(
                                parseFloat(e.target.value || "0") * 100,
                              ),
                            )
                          }
                          className="bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-neutral-900 dark:text-white w-20 appearance-none outline-none"
                        />
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 shrink-0 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1">
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? updateQuantity(item.id, -1)
                            : removeItem(item.id)
                        }
                        className="p-1 text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 size={14} />
                        ) : (
                          <Minus size={14} />
                        )}
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Adjustments Section */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Adjustments
              </h4>
              <button
                onClick={() => setIsAddingAdjustment(!isAddingAdjustment)}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
              >
                {isAddingAdjustment ? "Cancel" : "Add"}
              </button>
            </div>

            {isAddingAdjustment && (
              <div className="mb-3 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-2 text-sm shadow-sm">
                <input
                  type="text"
                  placeholder="Label (e.g. VIP Discount)"
                  value={newAdjustment.label}
                  onChange={(e) =>
                    setNewAdjustment({
                      ...newAdjustment,
                      label: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <select
                    value={newAdjustment.type}
                    onChange={(e) =>
                      setNewAdjustment({
                        ...newAdjustment,
                        type: e.target.value as AdjustmentType,
                      })
                    }
                    className="flex-1 p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md outline-none focus:border-blue-500"
                  >
                    <option value="DISCOUNT">Discount</option>
                    <option value="FEE">Fee</option>
                    <option value="SURCHARGE">Surcharge</option>
                  </select>
                  <select
                    value={newAdjustment.mode}
                    onChange={(e) =>
                      setNewAdjustment({
                        ...newAdjustment,
                        mode: e.target.value as AdjustmentMode,
                      })
                    }
                    className="w-1/3 p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md outline-none focus:border-blue-500"
                  >
                    <option value="FIXED">Fixed</option>
                    <option value="PERCENTAGE">%</option>
                  </select>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500">
                      {newAdjustment.mode === "FIXED" ? (
                        <CurrencyIcon size={14} />
                      ) : (
                        <Percent size={14} />
                      )}
                    </span>
                    <input
                      type="number"
                      placeholder="Value"
                      value={newAdjustment.value}
                      onChange={(e) =>
                        setNewAdjustment({
                          ...newAdjustment,
                          value: e.target.value,
                        })
                      }
                      className="w-full pl-8 p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleAddAdjustmentSubmit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {adjustments.length > 0 && (
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {adjustments.map((adj) => (
                  <div
                    key={adj.id}
                    className="flex items-center justify-between bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2 rounded-lg text-sm shadow-sm group"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        {adj.type === "DISCOUNT" ? (
                          <Minus size={12} className="text-emerald-500" />
                        ) : (
                          <Plus size={12} className="text-amber-500" />
                        )}
                        {adj.label}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                        {adj.type.toLowerCase()} •{" "}
                        {adj.mode === "PERCENTAGE" ? (
                          `${adj.value}%`
                        ) : (
                          <span className="flex items-center gap-0.5">
                            <CurrencyIcon size={10} />
                            {adj.value.toFixed(2)}
                          </span>
                        )}
                      </span>
                    </div>
                    <button
                      onClick={() => removeAdjustment(adj.id)}
                      className="text-neutral-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals & Actions */}
          <div className="p-4 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400">
                <span>Subtotal</span>
                <span className="flex items-center">
                  <CurrencyIcon size={14} className="mr-0.5" />
                  {(subtotal / 100).toFixed(2)}
                </span>
              </div>
              {adjustmentTotal !== 0 && (
                <div
                  className={`flex justify-between text-sm font-medium ${adjustmentTotal < 0 ? "text-emerald-600 dark:text-emerald-500" : "text-amber-600 dark:text-amber-500"}`}
                >
                  <span>Adjustments</span>
                  <span className="flex items-center">
                    {adjustmentTotal > 0 ? "+" : "-"}
                    <CurrencyIcon size={14} className="mx-0.5" />
                    {(Math.abs(adjustmentTotal) / 100).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg items-center font-bold text-neutral-900 dark:text-white pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span>Total</span>
                <span className="flex items-center">
                  <CurrencyIcon size={18} className="mr-0.5" />
                  {(finalTotal / 100).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={cartItems.length === 0 || isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Check size={20} />
              )}
              {isSubmitting ? "Creating Order..." : "Create Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
