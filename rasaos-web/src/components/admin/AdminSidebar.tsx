import { Link, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, X, Store } from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 flex flex-col w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              RasaOS
            </span>
            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              Admin
            </span>
          </div>
          <button
            className="md:hidden p-1 rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link
            to="/admin"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium transition-colors"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <div className="pt-4 pb-1 px-3 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            Management
          </div>
          <Link
            to="/admin/restaurants"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium transition-colors"
          >
            <Store size={18} />
            Restaurants
          </Link>
        </nav>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <LogOut size={18} />
            Go to Login Page
          </button>
        </div>
      </aside>
    </>
  );
}
