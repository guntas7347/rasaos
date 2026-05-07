import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  items: NavigationItem[];
  title?: string;
  logo?: React.ReactNode;
  isMobileOpen: boolean;
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Sidebar({
  items,
  title = "RasaOS",
  logo,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();

  return (
    <aside
      className={`fixed md:relative z-50 md:z-40 top-0 left-0 h-full flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-all duration-300 ease-in-out shadow-xl md:shadow-none
      ${isCollapsed ? "md:w-20" : "md:w-64"}
      ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"}
    `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 overflow-hidden">
          {logo}
          {(!isCollapsed || isMobileOpen) && (
            <span className="text-lg font-bold truncate bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400">
              {title}
            </span>
          )}
        </div>

        {/* Close button (mobile only) */}
        <button
          className="md:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          onClick={() => setIsMobileOpen(false)}
        >
          <X size={20} className="text-neutral-500" />
        </button>
      </div>

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 rounded-full p-1.5 hidden md:flex items-center justify-center hover:scale-110 transition-transform shadow-sm z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Nav */}
      <nav className={`flex-1 py-6 space-y-1 ${isCollapsed ? "px-3" : "px-4"}`}>
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center group relative ${
                isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
              } rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Icon
                size={isCollapsed ? 24 : 20}
                className={
                  isActive
                    ? "text-white"
                    : "group-hover:scale-110 transition-transform"
                }
              />
              {(!isCollapsed || isMobileOpen) && (
                <span className="truncate">{item.title}</span>
              )}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && !isMobileOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.title}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
        {!isCollapsed && (
          <span className="text-xs text-neutral-500 font-bold">
            RasaOS - POS Terminal for Restaurants
          </span>
        )}
      </div>
    </aside>
  );
}
