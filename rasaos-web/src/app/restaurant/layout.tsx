import { Outlet, Link } from "react-router-dom";
import {
  Store,
  LogOut,
  Settings,
  LayoutDashboard,
  Menu as MenuIcon,
  ShoppingCart,
  ListOrdered,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Sidebar } from "../../components/ui/Sidebar";

export default function RestaurantLayout() {
  const { restaurant, logout } = useAuth();

  const navItems = [
    {
      title: "Dashboard",
      href: "/restaurant",
      icon: LayoutDashboard,
    },
    {
      title: "Menu Management",
      href: "/restaurant/menu",
      icon: MenuIcon,
    },
    {
      title: "View Orders",
      href: "/restaurant/orders",
      icon: ListOrdered,
    },
    {
      title: "Create Order",
      href: "/restaurant/orders/new",
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="flex h-[100dvh] w-full bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* Collapsible Sidebar */}
      <Sidebar
        items={navItems}
        title={restaurant?.name || restaurant?.restaurantName || "RasaOS"}
        logo={
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Store size={16} />
          </div>
        }
      />

      <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        {/* Top Navigation Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-10 w-full shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="hidden sm:block text-lg font-medium text-neutral-800 dark:text-neutral-200">
              Restaurant Portal
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/restaurant/settings"
              className="p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Settings size={20} />
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors font-medium text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="p-6 lg:p-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
