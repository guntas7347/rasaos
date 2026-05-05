import { Bell, Utensils, Search } from "lucide-react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { SearchModal } from "../../components/SearchModal";

export default function RestaurantPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    categories,
    fetchRestaurantData,
    isLoading,
    restaurant,
    tableNumber,
    setTableNumber,
  } = useAppContext();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const table = searchParams.get("table");
    if (table) {
      setTableNumber(table);
    }
  }, [searchParams, setTableNumber]);

  useEffect(() => {
    if (slug) {
      fetchRestaurantData(slug).then((success) => {
        if (!success) navigate("/");
      });
    }
  }, [slug, fetchRestaurantData, navigate]);

  const restaurantName = restaurant?.name;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-76px)] items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading Menu...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <header className="sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Utensils size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">
              {restaurantName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tableNumber ? `Table ${tableNumber} • QR Order` : "QR Order"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transform transition active:scale-95"
          >
            <Search size={20} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Bell size={20} />
          </button>
        </div>
      </header>

      <main className="pb-24 flex-1 overflow-y-auto">
        {/* Hero / Promotion Section */}
        <div className="px-4 pt-6 pb-2">
          <div className="relative w-full h-40 rounded-2xl overflow-hidden shadow-lg shadow-primary/10">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-600 opacity-90"></div>
            <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 w-max px-2 py-0.5 rounded-md mb-2">
                Special Offer
              </span>
              <h2 className="text-2xl font-extrabold leading-tight">
                20% Off All
                <br />
                Signature Pizzas
              </h2>
              <p className="text-sm opacity-90 mt-1">
                Valid until 9:00 PM tonight
              </p>
            </div>
            {/* Background Icon (simulated with large text symbol) */}
            <div className="absolute right-[-20px] bottom-[-20px] opacity-20 text-[120px] leading-none pointer-events-none">
              🍕
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="px-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">
              Menu Categories
            </h2>
            <span className="text-sm font-medium text-primary cursor-pointer">
              View All
            </span>
          </div>

          {/* Vertical List of Categories */}
          <div className="flex flex-col gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => navigate(`/${slug}/c/${category.id}`)}
                className="group relative h-48 w-full rounded-2xl overflow-hidden shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${category.imageUrl}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <div className="absolute bottom-4 left-5">
                  <h3 className="text-white text-xl font-bold">
                    {category.name}
                  </h3>
                </div>

                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                  <span className="text-white text-xs font-bold">
                    {category.itemCount} Items
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
