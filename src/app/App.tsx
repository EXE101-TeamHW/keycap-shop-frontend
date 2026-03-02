// src/app/App.tsx
import { RouterProvider } from "react-router";
import { router } from "../app/routes";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}
