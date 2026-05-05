import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { callServer } from "../lib/helpers";
import { useNavigate, useLocation } from "react-router-dom";

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
  const location = useLocation();

  const fetchAuthData = async () => {
    setIsLoading(true);
    setError(null);

    const userRes = await callServer("/auth/me");

    if (!userRes.success) {
      setUser(null);
      setRestaurant(null);
      setIsLoading(false);
      return;
    }

    const userData = userRes.data;
    setUser(userData);

    // If user is admin, skip fetching restaurant
    if (userData.role === "ADMIN") {
      setRestaurant(null);
      setIsLoading(false);
      return;
    }

    // 2. Fetch Restaurant Data
    const restRes = await callServer("/restaurant");

    if (!restRes.success) {
      if (
        restRes.status === 404 ||
        restRes.data?.errorCode === "NO_RESTAURANT"
      ) {
        // Valid case: logged in but tenant isn't set up
        setRestaurant(null);
        // Redirect them to onboarding if they aren't already there
        if (!location.pathname.includes("/restaurant/new")) {
          navigate("/restaurant/new");
        }
      } else {
        setError(restRes.message || "Failed to fetch restaurant");
        setUser(null);
        setRestaurant(null);
        navigate("/login");
      }
    } else {
      // Success
      setRestaurant(restRes.data);
    }

    const menuRes = await callServer("/menu");
    console.log("menuRes", menuRes);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchAuthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Re-verify briefly on navigation, or just empty array

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
