import { ArrowLeft, Search, Plus } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppContext } from "../../../../context/AppContext";
import { CurrencyIcon } from "../../../../components/CurrencyIcon";
import { formatCurrency } from "../../../../utils/currency";
import { SearchModal } from "../../../../components/SearchModal";

export default function CategoryItemList() {
  const navigate = useNavigate();
  const { slug, categoryId } = useParams();
  const { categories, menuItems, fetchRestaurantData, isLoading } =
    useAppContext();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchRestaurantData(slug);
    }
  }, [slug, fetchRestaurantData]);

  // Find the category and items for this category
  const category = categories.find((c) => c.id === categoryId);
  const items = menuItems.filter((item) => item.categoryId === categoryId);

  // In a real app we'd fetch the restaurant details based on slug.
  // We'll just display a static title for now based on the requested format if category isn't found.
  const categoryName = category?.name || "Menu Items";

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-76px)] items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading items...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-76px)] bg-background-light dark:bg-background-dark">
      {/* Header Section */}
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center p-4 justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold tracking-tight">{categoryName}</h1>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transform transition active:scale-95"
          >
            <Search size={24} />
          </button>
        </div>

        {/* Horizontal Categories/Filters */}
        <div className="flex gap-3 px-4 pb-4 overflow-x-auto hide-scrollbar">
          <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary text-white px-5 shadow-sm shadow-primary/20">
            <p className="text-sm font-semibold">All</p>
          </div>
          <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary/10 dark:bg-primary/20 text-slate-700 dark:text-slate-200 px-5">
            <p className="text-sm font-medium">Popular</p>
          </div>
          <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary/10 dark:bg-primary/20 text-slate-700 dark:text-slate-200 px-5">
            <p className="text-sm font-medium">Vegan</p>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 px-4 py-2 space-y-3 pb-24">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-60">
            <p>No items found in this category.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="group relative flex items-center gap-4 bg-white dark:bg-white/5 p-3 rounded-xl border border-primary/5 shadow-sm"
            >
              <div className="relative">
                <Link to={`/${slug}/i/${item.id}`}>
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-24 shadow-sm"
                    style={{ backgroundImage: `url('${item.image}')` }}
                  ></div>
                </Link>
                {item.recommended && (
                  <div className="absolute -top-2 -left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                    Popular
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <Link
                    to={`/${slug}/i/${item.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    <p className="text-base font-bold leading-tight line-clamp-1">
                      {item.name}
                    </p>
                  </Link>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-snug line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <p className="text-primary font-bold text-lg">
                    <CurrencyIcon />
                    {item?.price ? formatCurrency(item.price) : "0.00"}
                  </p>
                  <Link
                    to={`/${slug}/i/${item.id}`}
                    className="bg-primary hover:bg-primary/90 text-white rounded-full p-1.5 flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform"
                  >
                    <Plus size={20} strokeWidth={3} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
