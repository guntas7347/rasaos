import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import {
  Store,
  LogOut,
  Settings,
  LayoutDashboard,
  Menu as MenuIcon,
  ShoppingCart,
  ListOrdered,
  Menu as Hamburger,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Sidebar } from "../../components/ui/Sidebar";
import toast from "react-hot-toast";

export default function RestaurantLayout() {
  const { restaurant, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { title: "Dashboard", href: "/restaurant", icon: LayoutDashboard },
    { title: "View Orders", href: "/restaurant/orders", icon: ListOrdered },
    {
      title: "Create Order",
      href: "/restaurant/orders/new",
      icon: ShoppingCart,
    },
    { title: "Menu Management", href: "/restaurant/menu", icon: MenuIcon },
  ];

  return (
    <div className="flex h-[100dvh] w-full bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        items={navItems}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        title={restaurant?.name || restaurant?.restaurantName || "RasaOS"}
        logo={
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
            <Store size={16} />
          </div>
        }
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30 md:px-8 shadow-sm">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 -ml-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              onClick={() => setIsMobileOpen(true)}
            >
              <Hamburger
                size={22}
                className="text-neutral-600 dark:text-neutral-400"
              />
            </button>

            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Restaurant Portal
              </h2>
              <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
                Management Dashboard
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/restaurant/settings"
              className="p-2.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all"
            >
              <Settings size={20} />
            </Link>

            <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800 mx-1 hidden sm:block" />

            <button
              onClick={logout}
              className="group flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-semibold transition-all"
            >
              <LogOut
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
