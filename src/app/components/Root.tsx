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
      <footer className="bg-slate-900 text-white pt-10 pb-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Top Section: Brand */}
          <div className="mb-8 border-b border-slate-800 pb-8 flex justify-center text-center">
            <div>
              <Link to="/" className="inline-block text-3xl font-black tracking-tight mb-3 hover:opacity-90 transition-opacity">
                HW<span className="text-pink-500">SHOP</span>
              </Link>
              <p className="text-slate-400 text-sm max-w-md mx-auto leading-6">
                Nâng tầm góc máy của bạn với những bộ keycap chất lượng cao và dịch vụ thiết kế custom độc quyền.
              </p>
            </div>
          </div>
          
          {/* Middle Section: Links & Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-sm">
            <div>
              <h4 className="font-bold text-base mb-3 text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span> Khám phá
              </h4>
              <ul className="space-y-2.5">
                <li><Link to="/san-pham" className="text-slate-400 hover:text-pink-400 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-200"><ArrowRight className="w-3.5 h-3.5"/> Tất cả Keycap</Link></li>
                <li><Link to="/custom" className="text-slate-400 hover:text-pink-400 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-200"><ArrowRight className="w-3.5 h-3.5"/> Dịch vụ Custom</Link></li>
                <li><Link to="/tin-tuc" className="text-slate-400 hover:text-pink-400 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-200"><ArrowRight className="w-3.5 h-3.5"/> Tin tức & Sự kiện</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-base mb-3 text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Khách hàng
              </h4>
              <ul className="space-y-2.5">
                <li><Link to="/chinh-sach" className="text-slate-400 hover:text-purple-400 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-200"><ArrowRight className="w-3.5 h-3.5"/> Chính sách & Điều khoản</Link></li>
                <li><Link to="/danh-gia" className="text-slate-400 hover:text-purple-400 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-200"><ArrowRight className="w-3.5 h-3.5"/> Đánh giá sản phẩm</Link></li>
                <li><Link to="/orders" className="text-slate-400 hover:text-purple-400 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-200"><ArrowRight className="w-3.5 h-3.5"/> Đơn hàng của tôi</Link></li>
              </ul>
            </div>
            
            <div className="lg:col-span-2">
              <h4 className="font-bold text-base mb-3 text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Liên hệ & Hỗ trợ
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 text-slate-400">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Quận 1, Thành phố Hồ Chí Minh, Việt Nam</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>0123.456.789 (8h00 - 22h00)</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>keycapdesigner@gmail.com</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 sm:items-end">
                  <p className="text-slate-400 font-medium">Kết nối với chúng tôi:</p>
                  <div className="flex gap-3">
                    <a href="https://www.facebook.com/profile.php?id=61590666837394" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-500 hover:text-white transition-all transform hover:scale-110">
                      <Facebook className="w-4 h-4" />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-500 hover:text-white transition-all transform hover:scale-110">
                      <Instagram className="w-4 h-4" />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-500 hover:text-white transition-all transform hover:scale-110">
                      <Twitter className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Section: Copyright */}
          <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} HWShop. Đã đăng ký bản quyền.</p>
            <div className="flex gap-4">
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
