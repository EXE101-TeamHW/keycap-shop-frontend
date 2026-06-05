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
      <footer className="bg-slate-950 text-white border-t border-slate-900 pt-16 pb-8 relative overflow-hidden mt-auto">
        {/* Subtle mesh background glows inside footer */}
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-600/5 rounded-full filter blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-600/5 rounded-full filter blur-[80px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Top/Middle Section: Brand & Link grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
            
            {/* Column 1: Brand Info (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              <Link to="/" className="inline-block text-4.5xl font-black tracking-tight hover:opacity-90 transition-opacity">
                HW<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">SHOP</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-semibold">
                Nâng tầm góc làm việc của bạn với những bộ keycap chất lượng cao cấp, bền bỉ và dịch vụ thiết kế custom độc quyền thể hiện trọn gu thẩm mỹ riêng.
              </p>
              
              <div className="flex gap-3 pt-2">
                {[
                  { icon: <Facebook className="w-4.5 h-4.5" />, href: "https://www.facebook.com/profile.php?id=61590666837394" },
                  { icon: <Instagram className="w-4.5 h-4.5" />, href: "#" },
                  { icon: <Twitter className="w-4.5 h-4.5" />, href: "#" }
                ].map((social, idx) => (
                  <a 
                    key={idx}
                    href={social.href} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 flex items-center justify-center text-slate-400 hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-md shadow-slate-950"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            
            {/* Column 2: Explore (2.5 cols) */}
            <div className="lg:col-span-2.5">
              <h4 className="font-black text-xs uppercase tracking-widest mb-5 text-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span> Khám phá
              </h4>
              <ul className="space-y-3 font-semibold text-sm">
                {[
                  { text: "Tất cả Keycap", path: "/san-pham" },
                  { text: "Dịch vụ Custom", path: "/custom" },
                  { text: "Tin tức & Sự kiện", path: "/tin-tuc" }
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link 
                      to={link.path} 
                      className="text-slate-400 hover:text-pink-400 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-200"
                    >
                      <ArrowRight className="w-3.5 h-3.5 opacity-60"/>
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Column 3: Customer (2.5 cols) */}
            <div className="lg:col-span-2.5">
              <h4 className="font-black text-xs uppercase tracking-widest mb-5 text-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Khách hàng
              </h4>
              <ul className="space-y-3 font-semibold text-sm">
                {[
                  { text: "Chính sách & Điều khoản", path: "/chinh-sach" },
                  { text: "Đánh giá sản phẩm", path: "/danh-gia" },
                  { text: "Đơn hàng của tôi", path: "/orders" }
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link 
                      to={link.path} 
                      className="text-slate-400 hover:text-purple-400 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-200"
                    >
                      <ArrowRight className="w-3.5 h-3.5 opacity-60"/>
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Column 4: Contact & Support (3 cols) */}
            <div className="lg:col-span-3 space-y-5">
              <h4 className="font-black text-xs uppercase tracking-widest mb-5 text-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Liên hệ
              </h4>
              <ul className="space-y-3.5 text-sm font-semibold text-slate-400">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">Quận 1, Thành phố Hồ Chí Minh, Việt Nam</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>0123.456.789 (8h - 22h)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="hover:text-emerald-400 transition-colors cursor-pointer">keycapdesigner@gmail.com</span>
                </li>
              </ul>
            </div>
            
          </div>
          
          {/* Bottom Section: Copyright & Policy Links */}
          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
            <p>© {new Date().getFullYear()} HWShop. Đã đăng ký bản quyền.</p>
            <div className="flex gap-6">
              <Link to="/chinh-sach" className="hover:text-white transition-colors">Điều khoản sử dụng</Link>
              <Link to="/chinh-sach" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
              <Link to="/chinh-sach" className="hover:text-white transition-colors">Chính sách Cookie</Link>
            </div>
          </div>
          
        </div>
      </footer>
    </div>
  );
}
