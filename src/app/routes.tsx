import { createBrowserRouter } from "react-router";
import { Root } from "../app/components/Root";
import { Home } from "../app/pages/Home";
import { ProductDetail } from "../app/pages/ProductDetail";
import { CustomService } from "../app/pages/CustomService";
import { Login } from "../app/pages/Login";
import { Cart } from "../app/pages/Cart";
import { Checkout } from "../app/pages/Checkout";
import { PaymentReturn } from "../app/pages/PaymentReturn";
import { OrderSuccess } from "../app/pages/OrderSuccess";
import { Orders } from "../app/pages/Orders";
import { TestPage } from "../app/pages/TestPage";
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
      { path: "checkout", Component: Checkout },
      { path: "payment/return", Component: PaymentReturn },
      { path: "order-success/:orderId", Component: OrderSuccess },
      { path: "orders", Component: Orders },
      { path: "test", Component: TestPage },
      { path: "staff", Component: StaffDashboard },
      { path: "admin", Component: AdminPanel },
      { path: "*", Component: NotFound },
    ],
  },
]);