import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./app/layout";
import HomePage from "./app/page";
import RestaurantPage from "./app/[slug]/page";
import CartPage from "./app/cart/page";
import OrdersPage from "./app/orders/page";
import CategoryItemListPage from "./app/[slug]/c/[categoryId]/page";
import ItemDetailsPage from "./app/[slug]/i/[itemId]/page";
import CheckoutPage from "./app/checkout/page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          {/* Note: In a real Next.js app this would be a dynamic file path. Here we map explicitly to the view. */}
          <Route
            path="/:slug/c/:categoryId"
            element={<CategoryItemListPage />}
          />

          {/* Default fallback route without branchId mapping to the Restaurant page just in case */}
          <Route path="/:slug" element={<RestaurantPage />} />

          {/* Note: In a real app we'd scope this by slug too, or rely on global item uniqueness */}
          <Route path="/:slug/i/:itemId" element={<ItemDetailsPage />} />

          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
