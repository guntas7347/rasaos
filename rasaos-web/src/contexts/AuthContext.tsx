import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { db, clearDB } from "@/lib/dexie/db";
import { callServer } from "@/lib/helpers";
import { localSuccess, localError } from "@/components/ui/ToasterProvider";

export interface AuthUser {
  id: string;
  name: string;
  role: "OWNER" | "ADMIN";
}

export interface AuthRestaurant {
  id: string;
  name: string;
  logo?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  restaurant: AuthRestaurant | null;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const hasFetchedRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [restaurant, setRestaurant] = useState<AuthRestaurant | null>(null);

  // Starts true to prevent UI rendering before we check local cache
  const [isLoading, setIsLoading] = useState(true);

  const loadAndRevalidate = async () => {
    // 1. INSTANT LOAD FROM DEXIE (Prevents white screen)
    const cached = await db.auth.get("main");
    if (cached) {
      setUser(cached.user as AuthUser);
      setRestaurant(cached.restaurant as AuthRestaurant);
      setIsLoading(false); // Unlock the UI immediately!
    }

    try {
      // 2. SILENT BACKGROUND FETCH (Auth)
      const userRes = await callServer("/auth/me");
      if (!userRes.success) throw new Error(userRes.message);

      const userData = userRes.data;
      let restaurantData = null;

      // 3. IF STAFF/OWNER, FETCH RESTAURANT & MENU IN BACKGROUND
      if (userData.role !== "ADMIN") {
        // Fetch both concurrently to save time
        const [restRes, menuRes] = await Promise.all([
          callServer("/restaurant"),
          callServer("/menu"),
        ]);

        if (!restRes.success) throw new Error(restRes.message);
        if (!menuRes.success) throw new Error(menuRes.message);

        restaurantData = restRes.data;

        // --- NEW: MENU SYNC LOGIC ---
        // Flatten the nested menu tree from Prisma
        const flatMenuItems = menuRes.data.categories.flatMap(
          (category: any) => category.items,
        );

        // Overwrite the Dexie Menu table (No React state needed!)
        await db.transaction("rw", db.menu, async () => {
          await db.menu.clear();
          await db.menu.bulkPut(flatMenuItems);
        });
        // -----------------------------
      }

      // 4. UPDATE REACT STATE & CACHE (For Auth only)
      setUser(userData);
      setRestaurant(restaurantData);

      await db.auth.put({
        key: "main",
        user: userData,
        restaurant: restaurantData,
        updatedAt: Date.now(),
      });
    } catch (err: any) {
      console.warn("Background check failed:", err.message);
      if (!cached) {
        setUser(null);
        setRestaurant(null);
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isProtectedPath =
      location.pathname.startsWith("/restaurant") ||
      location.pathname.startsWith("/admin");

    if (!isProtectedPath) {
      setIsLoading(false);
      return;
    }

    // Only run the initialization once per mount to prevent loop issues
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      loadAndRevalidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const logout = async () => {
    const confirm = window.confirm("Are you sure you want to logout?");
    if (!confirm) return;

    try {
      toast.loading("Logging out...", { id: "logout" });

      // Attempt server logout (will fail if offline)
      const response = await callServer(
        "/auth/logout",
        { method: "POST", timeout: 3000 },
        false,
      );

      if (response.success) {
        toast.success("Logged out securely", { id: "logout" });
      } else {
        throw new Error("Server logout failed");
      }
    } catch (error) {
      // THE OFFLINE LOGOUT FIX
      localError("Logged out locally (Offline Mode)", "logout");

      // Drop the ghost cookie flag for the background worker
      await db.meta.put({ key: "pendingLogout", value: true });
    } finally {
      // Always wipe local state and kick them out, regardless of network
      setUser(null);
      setRestaurant(null);
      toast.dismiss("logout");
      await clearDB();
      navigate("/login", { replace: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurant,
        isLoading,
        refreshAuth: loadAndRevalidate,
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
