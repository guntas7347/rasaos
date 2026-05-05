import { Outlet, useLocation, useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminFooter from "../../components/admin/AdminFooter";

interface RootContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useOutletContext<RootContextType>();

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-[100dvh] w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col h-full relative z-10 w-full overflow-hidden">
        <AdminHeader 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
        
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
          <AdminFooter />
        </main>
      </div>
    </div>
  );
}
