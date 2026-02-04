// src/app/routes.tsx
import { createBrowserRouter } from "react-router";
import { Root } from "../components/Root";
import { Home } from "../pages/Home";
import { ProductDetail } from "../pages/ProductDetail";
import { Login } from "../pages/Login";
import { Cart } from "../pages/Cart";
import { NotFound } from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "product/:id", Component: ProductDetail },
      { path: "login", Component: Login },
      { path: "cart", Component: Cart },
      { path: "*", Component: NotFound },
    ],
  },
]);
