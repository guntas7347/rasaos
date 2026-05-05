import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useOutletContext,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToasterProvider } from "./components/ui/ToasterProvider";
import RootLayout from "./app/layout";
import { lazy, Suspense } from "react";

import LoginPage from "./app/login/page";
import ForgetPasswordPage from "./app/login/forget-password/page";
import ResetPasswordPage from "./app/login/reset-password/page";
import SignupPage from "./app/signup/page";
import RestaurantLayout from "./app/restaurant/layout";
import RestaurantPage from "./app/restaurant/page";
import MenuManagementPage from "./app/restaurant/menu/page";
import CreateOrderPage from "./app/restaurant/orders/new/page";
import ViewOrdersPage from "./app/restaurant/orders/page";
import SettingsPage from "./app/restaurant/settings/page";

const AdminLayout = lazy(() => import("./app/admin/layout"));
const AdminPage = lazy(() => import("./app/admin/page"));
const AdminRestaurantsPage = lazy(() => import("./app/admin/restaurants/page"));
const AdminRestaurantDetailsPage = lazy(
  () => import("./app/admin/restaurants/[id]/page"),
);

const SuspenseOutlet = () => {
  const context = useOutletContext();
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 text-neutral-500">
          Loading admin portal...
        </div>
      }
    >
      <Outlet context={context} />
    </Suspense>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToasterProvider />
        <Routes>
          <Route element={<RootLayout />}>
            {/* Redirect root to login for now */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="login">
              <Route index element={<LoginPage />} />
              <Route path="forget-password" element={<ForgetPasswordPage />} />
              <Route
                path="reset-password/:uuid"
                element={<ResetPasswordPage />}
              />
            </Route>
            <Route path="signup" element={<SignupPage />} />

            <Route path="restaurant">
              <Route element={<RestaurantLayout />}>
                <Route index element={<RestaurantPage />} />
                <Route path="menu" element={<MenuManagementPage />} />
                <Route path="orders" element={<ViewOrdersPage />} />
                <Route path="orders/new" element={<CreateOrderPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="admin" element={<SuspenseOutlet />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminPage />} />
                <Route path="restaurants" element={<AdminRestaurantsPage />} />
                <Route
                  path="restaurants/:id"
                  element={<AdminRestaurantDetailsPage />}
                />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
