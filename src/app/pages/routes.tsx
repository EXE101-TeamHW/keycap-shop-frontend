// src/app/routes.tsx
import { createBrowserRouter } from "react-router";
import { Root } from "../components/Root";
import { Home } from "../pages/Home";
import { ProductDetail } from "../pages/ProductDetail";
import { Login } from "../pages/Login";
import { Cart } from "../pages/Cart";
import { NotFound } from "../pages/NotFound";
import { CustomService } from "../pages/CustomService";
import { AdminPanel } from "../pages/AdminPanel";
import { StaffDashboard } from "../pages/StaffDashboard";
import { OrderHistory } from "../pages/OrderHistory";
import { MyTickets } from "../pages/MyTickets";
import { Profile } from "../pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "product/:id", Component: ProductDetail },
      { path: "login", Component: Login },
      { path: "cart", Component: Cart },
      { path: "custom", Component: CustomService },
      { path: "orders", Component: OrderHistory },
      { path: "my-tickets", Component: MyTickets },
      { path: "profile", Component: Profile },
      { path: "admin", Component: AdminPanel },
      { path: "staff", Component: StaffDashboard },
      { path: "*", Component: NotFound },
    ],
  },
]);
