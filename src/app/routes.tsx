// src/app/routes.tsx
import { createBrowserRouter } from "react-router";
import { Root } from "../app/components/Root";
import { Home } from "../app/pages/Home";
import { ProductDetail } from "../app/pages/ProductDetail";
import { Login } from "../app/pages/Login";
import { Cart } from "../app/pages/Cart";
import { NotFound } from "../app/pages/NotFound";

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
