// src/app/components/ui/DashboardSidebar.tsx
import { Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Shield,
  FileText,
  BarChart3,
  MessageSquare
} from "lucide-react";

interface SidebarProps {
  role: "admin" | "staff";
}

export function DashboardSidebar({ role }: SidebarProps) {
  const location = useLocation();

  const adminMenuItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
    { icon: MessageSquare, label: "Reviews", path: "/admin/reviews" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  const staffMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/staff" },
    { icon: ShoppingCart, label: "Quản lý đơn hàng", path: "/staff/orders" },
    { icon: Package, label: "Quản lý sản phẩm", path: "/staff/products" },
    { icon: FileText, label: "Đơn tùy chỉnh", path: "/staff/custom-orders" },
  ];

  const menuItems = role === "admin" ? adminMenuItems : staffMenuItems;

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-black text-lg text-gray-900">KEYCAPS</div>
            <div className="text-xs text-gray-500 uppercase">{role} Panel</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-purple-700" : "text-gray-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
            {role === "admin" ? "A" : "S"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {role === "admin" ? "Admin User" : "Staff Member"}
            </div>
            <div className="text-xs text-gray-500">{role}@keycaps.com</div>
          </div>
        </div>
        <button className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all w-full">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
