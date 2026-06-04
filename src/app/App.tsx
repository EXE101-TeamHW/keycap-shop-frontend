// src/app/App.tsx
import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "../app/routes";
import { Toaster, toast } from "sonner";

const LOGIN_SUCCESS_TOAST_KEY = "loginSuccessToast";

export default function App() {
  useEffect(() => {
    const message = sessionStorage.getItem(LOGIN_SUCCESS_TOAST_KEY);
    if (!message) return;
    sessionStorage.removeItem(LOGIN_SUCCESS_TOAST_KEY);
    toast.success(message);
  }, []);

  return (
    <>
      <Toaster richColors position="top-right" offset={90} />
      <RouterProvider router={router} />
    </>
  );
}
