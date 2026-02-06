// src/app/components/Root.tsx
import { Outlet } from "react-router";
import { Navigation } from "../components/Navigation";
import { ThemeProvider } from "../providers/ThemeProvider";

export function Root() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="hwshop-ui-theme">
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <Navigation />
        <Outlet />
      </div>
    </ThemeProvider>
  );
}
