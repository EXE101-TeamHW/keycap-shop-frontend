import { Outlet, Link } from "react-router";
import { Navigation } from "../components/Navigation";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, ArrowRight } from "lucide-react";

export function Root() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Premium Dark Footer */}
      <footer className="bg-slate-900 text-white pt-20 pb-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Top Section: Brand */}
          <div className="mb-12 border-b border-slate-800 pb-12 flex justify-center text-center">
            <div>
              <Link to="/" className="inline-block text-5xl font-black tracking-tight mb-4 hover:opacity-90 transition-opacity">
                HW<span className="text-pink-500">SHOP</span>
              </Link>
              <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
                Nâng tầm góc máy của bạn với những bộ keycap chất lượng cao và dịch vụ thiết kế custom độc quyền.
              </p>
            </div>
          </div>
          
          {/* Middle Section: Links & Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div>
              <h4 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span> Khám phá
              </h4>
              <ul className="space-y-4">
                <li><Link to="/san-pham" className="text-slate-400 hover:text-pink-400 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-200"><ArrowRight className="w-4 h-4"/> Tất cả Keycap</Link></li>
                <li><Link to="/custom" className="text-slate-400 hover:text-pink-400 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-200"><ArrowRight className="w-4 h-4"/> Dịch vụ Custom</Link></li>
                <li><Link to="/tin-tuc" className="text-slate-400 hover:text-pink-400 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-200"><ArrowRight className="w-4 h-4"/> Tin tức & Sự kiện</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Khách hàng
              </h4>
              <ul className="space-y-4">
                <li><Link to="/chinh-sach" className="text-slate-400 hover:text-purple-400 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-200"><ArrowRight className="w-4 h-4"/> Chính sách & Điều khoản</Link></li>
                <li><Link to="/danh-gia" className="text-slate-400 hover:text-purple-400 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-200"><ArrowRight className="w-4 h-4"/> Đánh giá sản phẩm</Link></li>
                <li><Link to="/orders" className="text-slate-400 hover:text-purple-400 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-200"><ArrowRight className="w-4 h-4"/> Đơn hàng của tôi</Link></li>
              </ul>
            </div>
            
            <div className="lg:col-span-2">
              <h4 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Liên hệ & Hỗ trợ
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-slate-400">
                    <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Quận 1, Thành phố Hồ Chí Minh, Việt Nam</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>0123.456.789 (8h00 - 22h00)</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>support@hwshop.vn</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 sm:items-end">
                  <p className="text-slate-400 font-medium">Kết nối với chúng tôi:</p>
                  <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-500 hover:text-white transition-all transform hover:scale-110">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-500 hover:text-white transition-all transform hover:scale-110">
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-500 hover:text-white transition-all transform hover:scale-110">
                      <Twitter className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Section: Copyright */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>© {new Date().getFullYear()} HWShop. Đã đăng ký bản quyền.</p>
            <div className="flex gap-6">
              <Link to="/chinh-sach" className="hover:text-white transition-colors">Điều khoản</Link>
              <Link to="/chinh-sach" className="hover:text-white transition-colors">Bảo mật</Link>
              <Link to="/chinh-sach" className="hover:text-white transition-colors">Cookie</Link>
            </div>
          </div>
          
        </div>
      </footer>
    </div>
  );
}
