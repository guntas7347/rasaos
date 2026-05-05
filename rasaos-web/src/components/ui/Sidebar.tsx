import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  items: NavigationItem[];
  title?: string;
  logo?: React.ReactNode;
}

export function Sidebar({ items, title = "RasaOS", logo }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`relative flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-all duration-300 z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className={`h-16 flex items-center ${isCollapsed ? "justify-center" : "justify-between px-6"} border-b border-neutral-200 dark:border-neutral-800`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            {logo && <div className="flex-shrink-0">{logo}</div>}
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 whitespace-nowrap">
              {title}
            </span>
          </div>
        )}
        {isCollapsed && logo && (
          <div className="flex items-center justify-center w-full">{logo}</div>
        )}
      </div>

      {/* Collapse Toggle Button - Desktop Only */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 rounded-full p-1 hover:text-neutral-900 dark:hover:text-white transition-colors hidden md:block"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-6 space-y-1 ${isCollapsed ? "px-3" : "px-4"}`}>
        {items.map((item) => {
          const isActive = location.pathname.startsWith(item.href) && 
                           (item.href !== "/restaurant" || location.pathname === "/restaurant");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center ${
                isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
              } rounded-xl font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
              }`}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon size={isCollapsed ? 22 : 20} className="flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
