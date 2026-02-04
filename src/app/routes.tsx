import { createBrowserRouter } from "react-router";
import { Root } from "../app/components/Root";
import { Home } from "../app/pages/Home";
import { ProductDetail } from "../app/pages/ProductDetail";
import { CustomService } from "../app/pages/CustomService";
import { Login } from "../app/pages/Login";
import { Cart } from "../app/pages/Cart";
import { StaffDashboard } from "../app/pages/StaffDashboard";
import { AdminPanel } from "../app/pages/AdminPanel";
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
      { path: "staff", Component: StaffDashboard },
      { path: "admin", Component: AdminPanel },
      { path: "*", Component: NotFound },
    ],
  },
]);