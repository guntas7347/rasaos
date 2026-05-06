import { ArrowLeft, Share, Minus, Plus } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../../../context/AppContext";
import type {
  SelectedAddon,
  Addon,
  Variant,
} from "../../../../context/AppContext";
import { CurrencyIcon } from "../../../../components/CurrencyIcon";
import { formatCurrency } from "../../../../lib/currency";

export default function ItemDetailsPage() {
  const navigate = useNavigate();
  const { itemId, slug } = useParams();
  const { menuItems, categories, addToCart, fetchRestaurantData, isLoading } =
    useAppContext();

  useEffect(() => {
    if (slug) fetchRestaurantData(slug);
  }, [slug, fetchRestaurantData]);

  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const item = menuItems.find((m) => m.id === itemId);
  const category = categories.find((c) => c.id === item?.categoryId);

  // Default selection to first variant if available
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >(undefined);

  // Customization state
  const [selectedAddons, setSelectedAddons] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (
      item &&
      item.variants &&
      item.variants.length > 0 &&
      !selectedVariantId
    ) {
      setSelectedVariantId(item.variants[0].id);
    }
  }, [item, selectedVariantId]);

  const selectedVariant = useMemo(() => {
    if (!item || !item.variants) return null;
    return (
      item.variants.find((v) => v.id === selectedVariantId) || item.variants[0]
    );
  }, [item, selectedVariantId]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-76px)] items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading item...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-76px)] items-center justify-center">
        <p>Item not found.</p>
        <button className="mt-4 text-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  // Cost calculation based on variants and addons
  const activeAddonsList =
    category?.addons?.filter((a) => selectedAddons[a.id]) || [];
  const addonCost = activeAddonsList.reduce((sum, a) => sum + a.price, 0);

  const basePrice = selectedVariant ? selectedVariant.price : (item.variants?.length > 0 ? Math.min(...item.variants.map((v) => v.price)) : 0);

  const totalItemCost = (basePrice + addonCost) * quantity;

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: !prev[addonId],
    }));
  };

  const handleAddToCart = () => {
    const formattedAddons: SelectedAddon[] = activeAddonsList.map((a) => ({
      addonId: a.id,
      name: a.name,
      price: a.price,
    }));

    addToCart(item, quantity, selectedVariantId, formattedAddons);
    navigate(-1);
  };

  return (
    <div className="relative flex w-full flex-col overflow-x-hidden pb-32">
      {/* Top App Bar */}
      <div className="sticky top-0 z-50 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-primary/10">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          Item Details
        </h2>
        <div className="flex w-10 items-center justify-end">
          <button className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Share size={20} />
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="@container">
        <div className="px-0 sm:px-4 py-0 sm:py-3">
          <div
            className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden aspect-[4/3] sm:rounded-xl shadow-lg bg-slate-200 dark:bg-slate-800"
            style={
              item.imageUrl ? { backgroundImage: `url('${item.imageUrl}')` } : {}
            }
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        <div className="flex justify-between items-start pt-6 pb-2">
          <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold leading-tight">
            {item.name}
          </h1>
          {/* Base computed price falls back to zero safely without variant selected immediately */}
          <span className="text-primary text-2xl font-bold">
            <CurrencyIcon />
            {formatCurrency(basePrice) || "0.00"}
          </span>
        </div>

        {item.description && (
          <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed pb-6">
            {item.description}
          </p>
        )}

        {/* Dynamic Required Variants from Backend Mapping */}
        {item.variants && item.variants.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">
                Options
              </h3>
              <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                Required
              </span>
            </div>
            <div className="space-y-3">
              {item.variants.map((variant: Variant) => (
                <label
                  key={variant.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 border border-primary/10 rounded-xl cursor-pointer"
                >
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {variant.name} (<CurrencyIcon />
                    {formatCurrency(variant.price)})
                  </span>
                  <input
                    type="radio"
                    name="variant_selection"
                    className="w-5 h-5 text-primary focus:ring-primary border-primary/30"
                    checked={selectedVariantId === variant.id}
                    onChange={() => setSelectedVariantId(variant.id)}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Addons assigned to Category */}
        {category?.addons && category.addons.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">
                Extras
              </h3>
              <span className="text-slate-500 text-sm font-medium">
                Optional
              </span>
            </div>
            <div className="space-y-3">
              {category.addons.map((addon: Addon) => (
                <label
                  key={addon.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 border border-primary/10 rounded-xl cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {addon.name}
                    </span>
                    <span className="text-primary text-sm">
                      +<CurrencyIcon />
                      {formatCurrency(addon.price)}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded text-primary focus:ring-primary border-primary/30"
                    checked={!!selectedAddons[addon.id]}
                    onChange={() => handleToggleAddon(addon.id)}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        <div className="mb-10">
          <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold mb-3">
            Special Instructions
          </h3>
          <textarea
            className="w-full p-4 bg-white dark:bg-slate-800/50 border border-primary/10 rounded-xl focus:ring-primary focus:border-primary text-slate-800 dark:text-slate-200"
            placeholder="e.g. No onions, sauce on the side..."
            rows={3}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
          ></textarea>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-[76px] left-1/2 -translate-x-1/2 w-full max-w-md bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-primary/10 p-4 pb-4 z-40">
        <div className="flex items-center gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-primary/10 rounded-xl h-14 px-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex size-10 items-center justify-center text-primary hover:bg-primary/20 rounded-lg transition-colors"
            >
              <Minus size={20} />
            </button>
            <span className="w-10 text-center font-bold text-slate-900 dark:text-slate-100">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="flex size-10 items-center justify-center text-primary hover:bg-primary/20 rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-primary text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/20"
          >
            <span>Add to Cart</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/40"></span>
            <span>
              <CurrencyIcon />
              {formatCurrency(totalItemCost)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
