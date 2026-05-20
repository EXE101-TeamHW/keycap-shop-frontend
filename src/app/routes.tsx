import { createBrowserRouter } from "react-router";
import { Root } from "../app/components/Root";
import { ProtectedRoute } from "../app/components/ProtectedRoute";
import { Home } from "../app/pages/Home";
import { ProductDetail } from "../app/pages/ProductDetail";
import { CustomService } from "../app/pages/CustomService";
import { Login } from "../app/pages/Login";
import { Cart } from "../app/pages/Cart";
import { StaffDashboard } from "../app/pages/StaffDashboard";
import { AdminPanel } from "../app/pages/AdminPanel";
import { NotFound } from "../app/pages/NotFound";
import { OrderHistory } from "../app/pages/OrderHistory";
import { MyTickets } from "../app/pages/MyTickets";
import { Profile } from "../app/pages/Profile";
import { AdminLayout } from "../app/components/AdminLayout";
import { StaffLayout } from "../app/components/StaffLayout";
import { PaymentResult } from "../app/pages/PaymentResult";

export const router = createBrowserRouter([
  // ========== Public & Customer (Shop Flow) ==========
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "product/:id", Component: ProductDetail },
      { path: "login", Component: Login },
      {
        element: <ProtectedRoute allowedRoles={["CUSTOMER"]} />,
        children: [
          { path: "cart", Component: Cart },
          { path: "custom", Component: CustomService },
          { path: "orders", Component: OrderHistory },
          { path: "my-tickets", Component: MyTickets },
          { path: "profile", Component: Profile },
          { path: "payment-result", Component: PaymentResult },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
  // ========== Admin only ==========
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
    children: [
      {
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminPanel },
        ],
      },
    ],
  },
  // ========== Staff only ==========
  {
    path: "/staff",
    element: <ProtectedRoute allowedRoles={["STAFF"]} />,
    children: [
      {
        Component: StaffLayout,
        children: [
          { index: true, Component: StaffDashboard },
        ],
      },
    ],
  },
  // ========== 404 Fallback ==========
  { path: "/404", Component: NotFound },
  { path: "*", Component: NotFound },
]);