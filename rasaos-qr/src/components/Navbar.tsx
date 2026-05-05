import { Menu, ShoppingCart, Receipt, Home } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export function Navbar() {
  const { cartCount, restaurant } = useAppContext();

  const hasMenuData = !!restaurant?.slug;
  const menuLink = hasMenuData ? `/${restaurant.slug}` : "/";

  return (
    <>
      <nav className="absolute bottom-0 left-0 w-full border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg px-6 pb-6 pt-3 flex items-center justify-between z-30">
        {" "}
        {/* Menu / Home */}
        <NavLink
          to={menuLink}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 group ${isActive ? "text-primary" : "text-slate-400 dark:text-slate-500"}`
          }
        >
          {hasMenuData ? <Menu size={24} /> : <Home size={24} />}
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {hasMenuData ? "Menu" : "Home"}
          </span>
        </NavLink>
        {/* Cart */}
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 group relative ${isActive ? "text-primary" : "text-slate-400 dark:text-slate-500"}`
          }
        >
          <div className="relative flex items-center justify-center">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white dark:border-slate-900 cursor-default pointer-events-none">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Cart
          </span>
        </NavLink>
        {/* Orders */}
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 group ${isActive ? "text-primary" : "text-slate-400 dark:text-slate-500"}`
          }
        >
          <Receipt size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Orders
          </span>
        </NavLink>
      </nav>
      {/* iOS style Home Indicator area spacer */}
      <div className="h-[76px] w-full bg-transparent pointer-events-none"></div>
    </>
  );
}
