import { Outlet, useNavigate, useLocation } from "react-router";
import { LogOut, User, LayoutDashboard, Ticket } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "../api/authApi";

export function StaffLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authApi.logout();
    toast.success("Đăng xuất thành công!");
    navigate("/");
  };

  const navItems = [
    { label: "Tổng quan", path: "/staff", icon: LayoutDashboard },
    { label: "Tickets", path: "/staff/tickets", icon: Ticket },
    { label: "Đơn hàng", path: "/staff/orders", icon: Ticket },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 cursor-pointer" onClick={() => navigate("/staff")}>
          <div className="text-2xl font-black text-gray-900 tracking-tight">
            HWSHOP <span className="text-purple-600">STAFF</span>
          </div>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? "bg-purple-50 text-purple-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-purple-600" : "text-gray-400"}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">Staff</p>
              <p className="text-xs text-gray-500 truncate">Nhân viên / Designer</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
