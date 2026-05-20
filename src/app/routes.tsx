import { createBrowserRouter } from "react-router";
import { Root } from "../app/components/Root";
import { ProtectedRoute } from "../app/components/ProtectedRoute";
import { Login } from "../app/pages/Login";
import { NotFound } from "../app/pages/NotFound";
import { Home } from "../app/pages/customer/Home";
import { ProductDetail } from "../app/pages/customer/ProductDetail";
import { CustomService } from "../app/pages/customer/CustomService";
import { Cart } from "../app/pages/customer/Cart";
import { OrderHistory } from "../app/pages/customer/OrderHistory";
import { MyTickets } from "../app/pages/customer/MyTickets";
import { Profile } from "../app/pages/customer/Profile";
import { PaymentResult } from "../app/pages/customer/PaymentResult";

import { AdminLayout } from "../app/components/AdminLayout";
import { AdminDashboard } from "../app/pages/admin/AdminDashboard";
import { ProductManagement } from "../app/pages/admin/ProductManagement";
import { OrderManagement } from "../app/pages/admin/OrderManagement";
import { UserManagement } from "../app/pages/admin/UserManagement";

import { StaffLayout } from "../app/components/StaffLayout";
import { StaffDashboard } from "../app/pages/staff/StaffDashboard";
import { TicketManagement } from "../app/pages/staff/TicketManagement";

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
          { index: true, Component: AdminDashboard },
          { path: "products", Component: ProductManagement },
          { path: "orders", Component: OrderManagement },
          { path: "users", Component: UserManagement },
        ],
      },
    ],
  },
  // ========== Staff only ==========
  {
    path: "/staff",
    element: <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]} />,
    children: [
      {
        Component: StaffLayout,
        children: [
          { index: true, Component: StaffDashboard },
          { path: "tickets", Component: TicketManagement },
        ],
      },
    ],
  },
  // ========== 404 Fallback ==========
  { path: "/404", Component: NotFound },
  { path: "*", Component: NotFound },
]);