// src/app/pages/Home.tsx
import { useState, useEffect } from "react";
import Marquee from "react-fast-marquee";
import { ProductCard } from "../../components/ProductCard";
import { productApi } from "../../api/productApi";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { AiChatbot } from "../../components/AiChatbot";

export function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.getAll()
      .then((res) => {
        // Sort by popularity/stock for Hot Products section
        const sorted = (res.data || []).filter((p: any) => !p.status || p.status === "ACTIVE")
                                       .sort((a: any, b: any) => (b.stockQuantity ?? 0) - (a.stockQuantity ?? 0));
        setProducts(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      {/* Hero Section */}
      <section className="relative min-h-[560px] pt-14 overflow-hidden flex items-center border-b-2 border-slate-900 bg-slate-900">
        
        {/* Full Animated Background */}
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            className="w-full h-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1920&auto=format&fit=crop" 
              alt="Hero Background" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 px-4 md:px-6 pt-8 md:pt-12 w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-12 gap-4 md:gap-6 items-center pb-10">
            <div className="col-span-12 lg:col-span-7">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] tracking-tight uppercase text-white">
                <span className="block">HWShop<span className="text-pink-500">.</span></span>
                <span className="block">Keycap</span>
                <span className="block text-pink-500">Chính hãng</span>
              </h1>
              <p className="mt-5 text-base md:text-lg max-w-md font-medium text-slate-300 leading-relaxed">
                Nâng tầm trải nghiệm gõ phím của bạn với các bộ keycap thiết kế độc quyền, chất lượng cao cấp, bảo hành trọn đời.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})} className="px-6 py-3 bg-pink-600 text-white rounded-lg font-bold uppercase text-sm tracking-wider hover:bg-pink-700 transition-colors duration-200 shadow-lg shadow-pink-500/30">
                  Xem sản phẩm
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-lg font-bold uppercase text-sm tracking-wider hover:bg-white/20 transition-colors duration-200 border border-white/20">
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
            
            <div className="col-span-12 lg:col-span-5 lg:pl-4">
              <div className="grid grid-cols-2 gap-3 mt-8 lg:mt-0">
                {[
                  { value: "50K+", label: "Khách hàng" },
                  { value: "99%", label: "Hài lòng" },
                  { value: "24/7", label: "Hỗ trợ" },
                  { value: "100%", label: "Bảo hành" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-xl hover:shadow-2xl hover:bg-white/20 hover:-translate-y-1 transition-all duration-300">
                    <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
                    <div className="text-xs font-semibold uppercase tracking-wider mt-1 text-pink-400">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 inline-block">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 font-bold uppercase text-xs tracking-wider rounded-lg shadow-lg transform -rotate-2">
                  Giảm 10% tuần này
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="py-2.5 bg-slate-900 text-white overflow-hidden flex whitespace-nowrap border-b-2 border-slate-900">
        <Marquee gradient={false} speed={50} autoFill>
          <span className="text-xs md:text-sm font-bold uppercase tracking-wider mx-8">
            KEYCAP CUSTOM — BÀN PHÍM CƠ — GIAO HÀNG TOÀN QUỐC — BẢO HÀNH 1 ĐỔI 1 — HỖ TRỢ 24/7 —
          </span>
        </Marquee>
      </div>

      {/* Category Bento Grid */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center">
             <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900">
                Tìm phong cách <span className="text-pink-500">của bạn</span>
             </h2>
             <p className="mt-4 text-slate-500 text-lg">Khám phá các bộ keycap được thiết kế theo những chủ đề độc đáo nhất.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2 relative h-80 rounded-3xl overflow-hidden group cursor-pointer shadow-md" onClick={() => window.location.href='/san-pham?search=minimal'}>
                <img src="https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1000&auto=format&fit=crop" alt="Minimal Setup" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                   <h3 className="text-3xl font-bold text-white mb-2">Minimal Setup</h3>
                   <p className="text-slate-300">Tối giản, thanh lịch, tập trung vào trải nghiệm gõ.</p>
                </div>
             </div>
             
             <div className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer shadow-md" onClick={() => window.location.href='/san-pham?search=rgb'}>
                <img src="https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=600&auto=format&fit=crop" alt="RGB Gaming" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                   <h3 className="text-3xl font-bold text-white mb-2">RGB Gaming</h3>
                   <p className="text-slate-300">Xuyên led rực rỡ.</p>
                </div>
             </div>
             
             <div className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer shadow-md" onClick={() => window.location.href='/san-pham?search=retro'}>
                <img src="https://loremflickr.com/600/800/typewriter,keyboard?lock=3" alt="Retro Classic" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                   <h3 className="text-3xl font-bold text-white mb-2">Retro Classic</h3>
                   <p className="text-slate-300">Nét hoài cổ độc đáo.</p>
                </div>
             </div>
             
             <div className="md:col-span-2 relative h-80 rounded-3xl overflow-hidden group cursor-pointer shadow-md" onClick={() => window.location.href='/san-pham?search=pastel'}>
                <img src="https://loremflickr.com/1000/800/pink,keyboard,pastel?lock=4" alt="Sweet Pastel" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/80 via-pink-900/20 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                   <h3 className="text-3xl font-bold text-white mb-2">Sweet Pastel</h3>
                   <p className="text-slate-300">Tone màu ngọt ngào, mềm mại, phù hợp góc máy siêu "chill".</p>
                </div>
             </div>
          </div>
        </div>
      </motion.section>

      {/* Hot Products Section */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-16 bg-white border-b-2 border-slate-900 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 mb-10">
          <div className="flex items-end gap-4 mb-4">
            <span className="text-sm font-bold uppercase tracking-wider text-purple-600">Hot</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900">
            Bán chạy nhất<span className="text-purple-600">.</span>
          </h2>
        </div>
        
        <div className="relative px-6 max-w-7xl mx-auto">
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {products.slice(0, 8).map((product, i) => (
              <div key={product.id} className="min-w-[280px] w-[280px] snap-start shrink-0">
                <ProductCard product={product} index={i} />
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* About Us / Why Choose Us Section */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-20 bg-slate-50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight">
                Hơn cả một bộ <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Keycap.</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Tại HWShop, chúng tôi tin rằng mỗi chiếc bàn phím cơ không chỉ là công cụ làm việc, mà còn là một tác phẩm nghệ thuật phản ánh cá tính của bạn. Khởi nguồn từ đam mê mãnh liệt với Custom Keyboard, chúng tôi cam kết mang đến những bộ keycap chất lượng nhất, thiết kế độc đáo nhất.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Chất liệu cao cấp", desc: "Nhựa PBT Double-shot / Dye-sub siêu bền, không mờ phím, không bóng mồ hôi." },
                  { title: "Thiết kế giới hạn", desc: "Các bộ sưu tập độc quyền được hợp tác với các designer hàng đầu." },
                  { title: "Tương thích hoàn hảo", desc: "Hỗ trợ đa dạng layout từ 60%, 65%, 75%, TKL đến Fullsize." }
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                      <p className="text-slate-600 mt-1">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <button onClick={() => window.location.href = '/san-pham'} className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-slate-900 rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
                  <span className="uppercase tracking-wider">Xem bộ sưu tập</span>
                  <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="relative pb-8">
              <div className="grid grid-cols-2 gap-4">
                <img src="https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop" alt="Keycap 1" className="rounded-2xl shadow-lg w-full h-64 object-cover mt-8" />
                <img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop" alt="Keycap 2" className="rounded-2xl shadow-lg w-full h-64 object-cover" />
              </div>
              <div className="absolute top-0 -bottom-8 left-0 right-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-20 bg-slate-900 text-white relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          {localStorage.getItem("userId") ? (
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              Đừng bỏ lỡ <span className="text-pink-500">deal Hot!</span>
            </h2>
          ) : (
            <>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-10">
                Chưa có <span className="text-pink-500">tài khoản?</span>
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => window.location.href = '/register'} className="px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/30">
                  Đăng ký ngay
                </button>
                <button onClick={() => window.location.href = '/login'} className="px-10 py-4 bg-white text-slate-900 font-bold uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-colors shadow-lg">
                  Đăng nhập
                </button>
              </div>
            </>
          )}
        </div>
      </motion.section>

      {/* Floating AI Chatbot Assistant */}
      <AiChatbot />
    </motion.div>
  );
}
