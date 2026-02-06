import { createBrowserRouter } from "react-router";
import { Root } from "../app/components/Root";
import { Home } from "../app/pages/Home";
import { ProductDetail } from "../app/pages/ProductDetail";
import { CustomService } from "../app/pages/CustomService";
import { Login } from "../app/pages/Login";
import { Cart } from "../app/pages/Cart";
// Admin pages
import { AdminOverview } from "../app/pages/admin/AdminOverview";
import { AdminUsers } from "../app/pages/admin/AdminUsers";

// Staff pages
import { StaffOrders } from "../app/pages/staff/StaffOrders";
import { StaffProducts } from "../app/pages/staff/StaffProducts";
import { NotFound } from "../app/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "product/:id", Component: ProductDetail },
      { path: "custom", Component: CustomService },
      { path: "login", Component: Login },
      { path: "cart", Component: Cart },
            // ===== STAFF =====
      {
        path: "staff",
        children: [
          { index: true, Component: StaffOrders },     // /staff
          { path: "products", Component: StaffProducts }, // /staff/products
        ],
      },
            // ===== ADMIN =====
      {
        path: "admin",
        children: [
          { index: true, Component: AdminOverview }, // /admin
          { path: "users", Component: AdminUsers },  // /admin/users
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);