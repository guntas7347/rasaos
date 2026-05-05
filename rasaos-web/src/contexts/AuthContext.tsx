import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { callServer } from "../lib/helpers";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { db } from "../lib/dexie/dexie";

export interface User {
  id: string;
  email: string;
  role: "OWNER" | "ADMIN";
  restaurantId: string | null;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primaryColor?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  restaurant: Restaurant | null;
  menu: any | null;
  isLoading: boolean;
  error: string | null;
  refreshContext: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadFromCache = async () => {
    const cached = await db.auth.get("main");
    if (!cached) return;

    setUser(cached.user);
    setRestaurant(cached.restaurant);
    setMenu(cached.menu);
  };

  const fetchAuthData = async () => {
    setIsLoading(true);
    setError(null);

    // 1. Instant load from cache
    await loadFromCache();

    try {
      // 2. Fetch fresh data
      toast.loading("Fetching fresh data...", {
        id: "auth",
      });
      const userRes = await callServer("/auth/me");

      if (!userRes.success) throw new Error(userRes.message);

      const userData = userRes.data;
      let restaurantData = null;
      let menuData = [];

      if (userData.role !== "ADMIN") {
        const [restRes, menuRes] = await Promise.all([
          callServer("/restaurant"),
          callServer("/menu"),
        ]);

        if (!restRes.success) throw new Error(restRes.message);
        if (!menuRes.success) throw new Error(menuRes.message);

        restaurantData = restRes.data;
        menuData = menuRes.data;
      }

      // 3. Update state
      setUser(userData);
      setRestaurant(restaurantData);
      setMenu(menuData);

      // 4. Persist to Dexie
      await db.auth.put({
        key: "main",
        user: userData,
        restaurant: restaurantData,
        menu: menuData,
        updatedAt: Date.now(),
      });

      toast.success("Fresh data loaded", {
        id: "auth",
      });
    } catch (err: any) {
      // If cache exists → do not hard fail
      const cached = await db.auth.get("main");

      if (!cached) {
        setUser(null);
        setRestaurant(null);
        setMenu([]);
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Re-verify briefly on navigation, or just empty array

  const logout = async () => {
    await callServer("/auth/logout", { method: "POST" });
    setUser(null);
    setRestaurant(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurant,
        menu,
        isLoading,
        error,
        refreshContext: fetchAuthData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
