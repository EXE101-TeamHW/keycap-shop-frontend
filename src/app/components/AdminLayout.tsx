import { Outlet, useNavigate } from "react-router";
import { LogOut, User } from "lucide-react";

export function AdminLayout() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/admin")}>
            <div className="text-2xl font-black text-gray-900 tracking-tight">HWSHOP <span className="text-purple-600">ADMIN</span></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full text-purple-700 text-sm font-semibold">
              <User className="w-4 h-4" />
              Administrator
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} HWShop Admin System. All rights reserved.
      </footer>
    </div>
  );
}
