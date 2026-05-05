import { Menu, Bell, Sun, Moon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  onMenuClick: () => void;
  title?: string;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function AdminHeader({ onMenuClick, title = "Overview", isDarkMode, onToggleDarkMode }: AdminHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden p-2 -ml-2 rounded-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white md:hidden">
          RasaOS Admin
        </h1>
        <h2 className="hidden md:block text-lg font-medium text-neutral-800 dark:text-neutral-200">
          {title}
        </h2>
      </div>
      
      <div className="flex items-center gap-3">
        {onToggleDarkMode && (
          <button 
            onClick={onToggleDarkMode}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}
        <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors relative">
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
          <Bell size={18} />
        </button>
        <button 
          onClick={() => navigate('/login')}
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-500 transition-colors"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
