import { Outlet } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

export default function RootLayout() {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 transition-colors duration-300">
      <Outlet context={{ isDarkMode, toggleDarkMode: toggleTheme }} />
    </div>
  );
}
