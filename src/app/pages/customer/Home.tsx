// src/app/pages/Home.tsx
import { useState, useEffect } from "react";
import Marquee from "react-fast-marquee";
import { ProductCard } from "../../components/ProductCard";
import { productApi } from "../../api/productApi";
import { PlayCircle, Sparkles, ShieldCheck, Palette, Keyboard } from "lucide-react";
import { motion } from "motion/react";
import { AiChatbot } from "../../components/AiChatbot";

const HERO_VIDEO_URL = "https://res.cloudinary.com/dcbd3ct16/video/upload/f_auto,q_auto/14203460_3840_2160_25fps_fv100t.mp4";

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
      <section className="relative min-h-[580px] pt-14 overflow-hidden flex items-center bg-slate-950">
        
        {/* Full Motion Background */}
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            className="h-full w-full bg-slate-950"
          >
            <video
              key={HERO_VIDEO_URL}
              className="h-full w-full object-cover opacity-80"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source
                src={HERO_VIDEO_URL}
                type="video/mp4"
              />
            </video>
          </motion.div>
          {/* Soft dark overlays to focus text and blend bottom */}
          <div className="absolute inset-0 bg-slate-950/30 z-10" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />
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
                <button onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})} className="px-6 py-3 bg-pink-600 text-white rounded-lg font-bold uppercase text-sm tracking-wider hover:bg-pink-700 transition-colors duration-200 shadow-lg shadow-pink-500/30 cursor-pointer">
                  Xem sản phẩm
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-lg font-bold uppercase text-sm tracking-wider hover:bg-white/20 transition-colors duration-200 border border-white/20 cursor-pointer">
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

      {/* Brand Video Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="bg-white py-20"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-[0.86fr_1.14fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-pink-600">
              <PlayCircle className="h-4 w-4" />
              Video trải nghiệm
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 md:text-5xl">
              Nhìn gần hơn vào <span className="text-pink-500">thế giới keycap.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-600 md:text-lg">
              Khám phá cảm hứng setup, chất liệu và tinh thần custom keyboard mà HWShop muốn mang đến cho góc làm việc của bạn.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { value: "PBT", label: "Chất liệu" },
                { value: "RGB", label: "Cá tính" },
                { value: "Custom", label: "Theo gu" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-lg font-black text-slate-950">{item.value}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-900/20">
              <div className="aspect-video">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube-nocookie.com/embed/yxRT5YpE30Q?rel=0&modestbranding=1&controls=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1"
                  title="HWShop keycap video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Category Bento Grid */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-24 bg-gradient-to-b from-slate-50/50 to-white"
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
        className="py-20 bg-gradient-to-b from-white to-slate-50/50 overflow-hidden"
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
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-24 bg-gradient-to-b from-slate-50/50 to-white relative overflow-hidden"
      >
        {/* Subtle decorative glowing blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Content (7 columns) */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-xs font-black text-purple-600 uppercase tracking-widest mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  Về chúng tôi
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight uppercase tracking-tight">
                  Hơn cả một bộ <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500">
                    Keycap độc bản.
                  </span>
                </h2>
              </div>
              
              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl font-medium">
                Tại <strong className="text-slate-950 font-black">HWShop</strong>, chúng tôi tin rằng mỗi chiếc bàn phím cơ không chỉ là công cụ làm việc đơn thuần, mà còn là một tác phẩm nghệ thuật thu nhỏ phản chiếu trọn vẹn phong cách cá nhân của bạn. Đam mê custom bàn phím thúc đẩy chúng tôi tuyển chọn những bộ keycap bền bỉ, thẩm mỹ cao nhất.
              </p>
              
              {/* Feature Cards list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {[
                  { 
                    title: "Chất liệu cao cấp", 
                    desc: "Nhựa PBT Double-shot / Dye-sub siêu dày, âm thanh trầm ấm (thocky), không bóng nhám.", 
                    icon: <ShieldCheck className="w-5 h-5 text-purple-600" />
                  },
                  { 
                    title: "Thiết kế giới hạn", 
                    desc: "Các phối màu độc quyền, số lượng giới hạn, kết hợp cùng các nghệ sĩ và studio hàng đầu.", 
                    icon: <Palette className="w-5 h-5 text-pink-600" />
                  },
                  { 
                    title: "Tương thích hoàn hảo", 
                    desc: "Hỗ trợ đầy đủ các phím bổ sung (1.75u shift, spacebar ngắn...) cân mọi layout từ 60% đến Fullsize.", 
                    icon: <Keyboard className="w-5 h-5 text-blue-600" />
                  }
                ].map((feature, idx) => (
                  <div 
                    key={idx} 
                    className={`p-5 rounded-2xl border border-slate-150 bg-white shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5 ${idx === 2 ? 'sm:col-span-2' : ''}`}
                  >
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 shrink-0 bg-white rounded-xl shadow-sm border border-slate-150 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-800 tracking-tight">{feature.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => window.location.href = '/san-pham'} 
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-black text-white transition-all duration-300 bg-slate-900 rounded-xl hover:bg-purple-600 hover:scale-[1.02] active:scale-95 shadow-lg shadow-slate-900/10 hover:shadow-purple-500/20 cursor-pointer"
                >
                  <span className="uppercase tracking-wider text-xs">Xem bộ sưu tập</span>
                  <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Right Images (5 columns) */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none" />
              
              <div className="relative grid grid-cols-2 gap-4 z-10">
                <div className="relative group overflow-hidden rounded-2xl shadow-xl mt-8">
                  <img 
                    src="https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop" 
                    alt="Keycap 1" 
                    className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-xs font-bold uppercase tracking-wider">PBT Dye-sublimated</span>
                  </div>
                </div>
                
                <div className="relative group overflow-hidden rounded-2xl shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop" 
                    alt="Keycap 2" 
                    className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-xs font-bold uppercase tracking-wider">Double-shot Mould</span>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute -top-3 -right-3 bg-white border border-purple-100 rounded-2xl px-4 py-2 shadow-lg z-20 flex items-center gap-2 animate-bounce" style={{ animationDuration: '4s' }}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">100% PBT Profile SA/Cherry</span>
                </div>
                
                <div className="absolute -bottom-3 -left-3 bg-slate-900 border border-slate-800 text-white rounded-2xl px-4 py-2 shadow-lg z-20 flex items-center gap-2 animate-bounce" style={{ animationDuration: '6s' }}>
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Limitless Custom</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-28 bg-gradient-to-b from-slate-950 to-slate-900 text-white relative overflow-hidden">
        {/* Curved SVG Divider for transition from Light (About Us bottom) to Dark (CTA top) */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-20">
          <svg className="relative block w-full h-12 text-white fill-current" viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13,86.19-14.39,170.18-55.33,257.6-56.6C1099.6,27.7,1153,38.16,1200,56.29V0Z"></path>
          </svg>
        </div>

        {/* Neon Mesh Gradients */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-[400px] h-[400px] bg-pink-600/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8 pt-8"
        >
          {localStorage.getItem("userId") ? (
            <div className="p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl space-y-6">
              <span className="px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-full text-xs font-bold uppercase tracking-widest">
                Ưu đãi độc quyền cho thành viên
              </span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
                Đừng bỏ lỡ <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-400">
                  Deal Hot Tuần Này!
                </span>
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed font-semibold">
                Theo dõi trang chủ để săn các bộ keycap Group Buy giới hạn và nhận mã giảm giá lên đến 15% độc quyền cho thành viên HWShop.
              </p>
              <div className="pt-2">
                <button 
                  onClick={() => window.location.href = '/san-pham'} 
                  className="px-8 py-3.5 bg-white text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl hover:bg-pink-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-white/5 cursor-pointer animate-pulse"
                >
                  Khám phá cửa hàng ngay
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl space-y-8">
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs font-bold uppercase tracking-widest">
                Gia nhập cộng đồng HWShop
              </span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
                Chưa có <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-400">tài khoản?</span>
              </h2>
              <p className="text-slate-300 max-w-lg mx-auto text-sm leading-relaxed font-semibold">
                Đăng ký tài khoản ngay hôm nay để tích điểm, quản lý đơn hàng thiết kế custom và nhận các đặc quyền giảm giá sớm nhất từ HWShop.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <button 
                  onClick={() => window.location.href = '/login?mode=signup'} 
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:opacity-95 transition-opacity shadow-lg shadow-pink-500/20 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Đăng ký tài khoản
                </button>
                <button 
                  onClick={() => window.location.href = '/login'} 
                  className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-black border border-white/10 uppercase text-xs tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Floating AI Chatbot Assistant */}
      <AiChatbot />
    </motion.div>
  );
}
