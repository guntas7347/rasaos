import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { AppProvider } from "../context/AppContext";

export default function Layout() {
  return (
    <AppProvider>
      <div className="h-full bg-background-light dark:bg-background-dark">
        <div className="relative h-full w-full max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl flex flex-col">
          <main className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
            <Outlet />
          </main>
          <Navbar />
        </div>
      </div>
    </AppProvider>
  );
}
