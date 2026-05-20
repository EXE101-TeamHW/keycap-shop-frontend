// src/app/components/Root.tsx
import { Outlet } from "react-router";
import { Navigation } from "../components/Navigation";

export function Root() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Customer / Public Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-black text-gray-900 tracking-tight mb-4">
                HW<span className="text-purple-600">SHOP</span>
              </div>
              <p className="text-gray-500 text-sm max-w-sm">
                Chúng tôi cung cấp các bộ keycap chất lượng cao và dịch vụ thiết kế custom độc quyền dành riêng cho bàn phím cơ của bạn.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Liên kết</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/" className="hover:text-purple-600 transition-colors">Trang chủ</a></li>
                <li><a href="/custom" className="hover:text-purple-600 transition-colors">Dịch vụ Custom</a></li>
                <li><a href="/orders" className="hover:text-purple-600 transition-colors">Đơn hàng của tôi</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>Email: support@hwshop.com</li>
                <li>Hotline: 0123.456.789</li>
                <li>Địa chỉ: TP. Hồ Chí Minh</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} HWShop. Đã đăng ký bản quyền.
          </div>
        </div>
      </footer>
    </div>
  );
}
