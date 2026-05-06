import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./app/layout";
import HomePage from "./app/page";
import RestaurantPage from "./app/[slug]/page";
import CartPage from "./app/cart/page";
import OrdersPage from "./app/orders/page";
import CategoryItemListPage from "./app/[slug]/c/[categoryId]/page";
import ItemDetailsPage from "./app/[slug]/i/[itemId]/page";
import CheckoutPage from "./app/checkout/page";
import ScrollToTop from "./lib/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route
            path="/:slug/c/:categoryId"
            element={<CategoryItemListPage />}
          />
          <Route path="/:slug" element={<RestaurantPage />} />
          <Route path="/:slug/i/:itemId" element={<ItemDetailsPage />} />

          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
