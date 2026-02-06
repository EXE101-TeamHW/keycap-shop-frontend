import { Bell, Search, Settings, User, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";

interface DashboardHeaderProps {
  role: "admin" | "staff";
  userName: string;
  onMenuToggle?: () => void; // For mobile sidebar toggle
}

export function DashboardHeader({ role, userName, onMenuToggle }: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // TODO: Thay bằng data từ API sau
  const notifications = [
    { id: 1, title: "New order received", message: "Order #ORD-523", time: "2 mins ago", unread: true },
    { id: 2, title: "Product stock low", message: "Neon Dreams - 5 units left", time: "1 hour ago", unread: true },
    { id: 3, title: "New user registered", message: "sarah@example.com", time: "3 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Mobile menu + Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Thông báo</h3>
                      <span className="text-sm text-purple-600 font-semibold cursor-pointer hover:text-purple-700">
                        Đánh dấu đã đọc
                      </span>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors ${
                          notif.unread ? "bg-purple-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {notif.unread && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm">{notif.title}</div>
                            <div className="text-sm text-gray-600 truncate">{notif.message}</div>
                            <div className="text-xs text-gray-500 mt-1">{notif.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button className="text-sm text-purple-600 font-semibold hover:text-purple-700">
                      Xem tất cả
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Settings */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-6 h-6 text-gray-600" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-gray-900">{userName}</div>
                <div className="text-xs text-gray-500 capitalize">{role}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfile && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfile(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-200">
                    <div className="font-semibold text-gray-900">{userName}</div>
                    <div className="text-sm text-gray-500">{role}@keycaps.com</div>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Hồ sơ</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Cài đặt</span>
                    </button>
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <button className="w-full px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-6 pb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
