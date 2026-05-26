import { useState } from "react";
import { Shield, Truck, RefreshCcw, FileText, Lock, CreditCard, ChevronRight, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const policies = [
  {
    id: "terms",
    icon: FileText,
    title: "Điều khoản dịch vụ",
    short: "Các quy định và thỏa thuận cơ bản khi sử dụng website.",
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    content: (
      <div className="text-slate-600 leading-relaxed space-y-4">
        <p>
          Khi truy cập và mua sắm tại Website của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được quy định dưới đây. Chúng tôi có quyền thay đổi, chỉnh sửa hoặc cập nhật các điều khoản này vào bất kỳ lúc nào mà không cần thông báo trước.
        </p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Thông tin xác thực:</strong> Khách hàng cam kết cung cấp thông tin cá nhân (họ tên, số điện thoại, địa chỉ) chính xác để phục vụ cho việc giao hàng nhanh chóng.</li>
            <li><strong>Sử dụng hợp pháp:</strong> Không sử dụng website vào mục đích gian lận, phá hoại hoặc phát tán mã độc.</li>
            <li><strong>Bản quyền:</strong> Mọi hình ảnh, nội dung trên website đều thuộc bản quyền của Keycap Shop. Việc sao chép phải được sự đồng ý bằng văn bản.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "privacy",
    icon: Lock,
    title: "Chính sách bảo mật",
    short: "Cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    content: (
      <div className="text-slate-600 leading-relaxed space-y-4">
        <p>
          Bảo vệ thông tin cá nhân của khách hàng là ưu tiên hàng đầu của chúng tôi. Chúng tôi cam kết bảo vệ sự riêng tư của bạn trực tuyến.
        </p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Thu thập thông tin:</strong> Chúng tôi chỉ thu thập các thông tin cần thiết cho quá trình xử lý đơn hàng và chăm sóc khách hàng (như Tên, SĐT, Địa chỉ, Email).</li>
            <li><strong>Bảo mật dữ liệu:</strong> Mật khẩu và thông tin thẻ thanh toán của bạn được mã hóa hoàn toàn và chúng tôi không lưu trữ thông tin thẻ tín dụng của bạn trên máy chủ.</li>
            <li><strong>Cam kết 3 Không:</strong> Tuyệt đối không mua bán, trao đổi, hay chia sẻ dữ liệu khách hàng cho bên thứ ba vì mục đích thương mại.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "warranty",
    icon: Shield,
    title: "Chính sách bảo hành",
    short: "Cam kết chất lượng và hỗ trợ lỗi từ nhà sản xuất.",
    color: "text-purple-600",
    bg: "bg-purple-100",
    content: (
      <div className="text-slate-600 leading-relaxed space-y-4">
        <p>
          Tất cả sản phẩm keycap bán ra đều được áp dụng chính sách bảo hành chặt chẽ nhằm đảm bảo quyền lợi tốt nhất cho người mua.
        </p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Bảo hành 1 đổi 1 trong 30 ngày:</strong> Áp dụng ngay nếu phát hiện lỗi từ nhà sản xuất như nứt, gãy stem, thiếu phím, hoặc sai màu so với mô tả.</li>
            <li><strong>Bảo hành phai màu trọn đời:</strong> Chỉ áp dụng đối với các bộ keycap sử dụng công nghệ in Dye-sub hoặc Double-shot do tính chất bền bỉ của chúng.</li>
            <li><strong>Trường hợp bị từ chối:</strong> Không bảo hành cho các trường hợp làm rơi vỡ, trầy xước do ngoại lực, mài mòn do sử dụng sai cách, hoặc tự ý dùng hóa chất tẩy rửa mạnh làm hỏng bề mặt keycap.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "return",
    icon: RefreshCcw,
    title: "Chính sách đổi trả",
    short: "Điều kiện và quy trình đổi hàng/trả hàng trong vòng 7 ngày.",
    color: "text-pink-600",
    bg: "bg-pink-100",
    content: (
      <div className="text-slate-600 leading-relaxed space-y-4">
        <p>
          Chúng tôi hỗ trợ đổi trả sản phẩm trong vòng <strong>7 ngày</strong> kể từ ngày bạn nhận được hàng với các điều kiện nghiêm ngặt sau để đảm bảo chất lượng:
        </p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <ul className="list-disc pl-5 space-y-2">
            <li>Sản phẩm phải còn nguyên vẹn, <strong>chưa qua sử dụng</strong>, không bị trầy xước hay dính bẩn.</li>
            <li>Còn đầy đủ hộp nguyên bản, vỏ bọc, phụ kiện đi kèm (như keypuller, nhãn dán, switch tặng kèm nếu có).</li>
            <li><strong>Phí vận chuyển đổi trả:</strong> 
              <br/>- Nếu lỗi do shop (giao sai hàng, hàng lỗi), shop chịu 100% phí vận chuyển. 
              <br/>- Nếu đổi do khách hàng thay đổi ý định, khách hàng vui lòng chịu toàn bộ phí vận chuyển 2 chiều.
            </li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "shipping",
    icon: Truck,
    title: "Chính sách vận chuyển",
    short: "Thông tin phí ship, thời gian giao hàng và khu vực áp dụng.",
    color: "text-blue-600",
    bg: "bg-blue-100",
    content: (
      <div className="text-slate-600 leading-relaxed space-y-4">
        <p>
          Hệ thống vận chuyển của chúng tôi được tối ưu hóa để đưa sản phẩm đến tay bạn một cách an toàn và nhanh chóng nhất. Chúng tôi hợp tác với các đơn vị vận chuyển uy tín hàng đầu.
        </p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Miễn phí vận chuyển (Freeship):</strong> Áp dụng cho mọi đơn hàng có giá trị từ <strong>1.250.000đ</strong> trở lên, hoặc các đơn đặt làm Custom Keycap đặc biệt.</li>
            <li><strong>Phí tiêu chuẩn:</strong> Đồng giá <strong>30.000đ</strong> trên toàn quốc. Riêng khu vực nội thành TP.HCM (hoặc các khu vực lân cận chi nhánh shop) mức phí ưu đãi là <strong>15.000đ</strong>.</li>
            <li><strong>Thời gian giao hàng:</strong> 
              <br/>- Từ 1-2 ngày đối với đơn hàng nội thành TP.HCM/Hà Nội. 
              <br/>- Và 3-5 ngày đối với các tỉnh/thành phố khác. 
              <br/>- <em>Lưu ý: Đơn hàng đặt trước (Pre-order) sẽ tuân theo thời gian thông báo riêng trên trang sản phẩm.</em>
            </li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "Chính sách thanh toán",
    short: "Các phương thức thanh toán an toàn bao gồm COD, thẻ, ví điện tử.",
    color: "text-amber-600",
    bg: "bg-amber-100",
    content: (
      <div className="text-slate-600 leading-relaxed space-y-4">
        <p>
          Chúng tôi hỗ trợ nhiều phương thức thanh toán an toàn, linh hoạt và tiện lợi để bạn dễ dàng lựa chọn trong quá trình mua sắm:
        </p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Thanh toán trực tuyến (Online):</strong> Hỗ trợ quét mã QR, chuyển khoản nhanh qua thẻ ATM nội địa, Visa/Mastercard quốc tế thông qua cổng thanh toán bảo mật VNPAY hoặc PayOS.</li>
            <li><strong>Thanh toán khi nhận hàng (COD):</strong> Quý khách thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng sau khi nhận và kiểm tra tình trạng hộp bên ngoài.</li>
            <li><strong>Quy định Đặt cọc (Đối với hàng Custom):</strong> Khách hàng yêu cầu custom keycap riêng bắt buộc thanh toán cọc trước <strong>50%</strong> giá trị đơn hàng để chúng tôi tiến hành chuẩn bị vật liệu và sản xuất. Số tiền còn lại sẽ thanh toán khi nhận hàng.</li>
          </ul>
        </div>
      </div>
    )
  }
];

export function Policies() {
  const [activeTab, setActiveTab] = useState(policies[0]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-slate-900 text-white py-16 px-6 text-center border-b-2 border-slate-900">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Trung tâm <span className="text-pink-500">Chính sách</span>
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Khám phá các chính sách bán hàng minh bạch của chúng tôi. Chọn một chuyên mục bên dưới để đọc chi tiết.
          </p>
        </motion.div>
      </div>
      
      {/* Layout Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Sidebar (Menu) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-1/3 shrink-0"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <Info className="w-5 h-5 text-slate-500" />
                <h3 className="font-bold text-slate-800 uppercase tracking-wide">Mục lục</h3>
              </div>
              <div className="flex flex-col p-2">
                {policies.map((policy) => {
                  const Icon = policy.icon;
                  const isActive = activeTab.id === policy.id;
                  
                  return (
                    <button
                      key={policy.id}
                      onClick={() => setActiveTab(policy)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                        isActive 
                          ? "bg-purple-50 border border-purple-100" 
                          : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className={`w-10 h-10 shrink-0 ${policy.bg} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${policy.color}`} />
                      </div>
                      <span className={`font-semibold text-sm flex-1 ${isActive ? 'text-purple-700' : 'text-slate-600'}`}>
                        {policy.title}
                      </span>
                      {isActive && (
                        <motion.div layoutId="indicator">
                          <ChevronRight className="w-4 h-4 text-purple-600" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
          
          {/* Right Content (Book Style) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-2/3"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[500px] overflow-hidden relative">
              {/* Decorative top border */}
              <div className="h-2 w-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
              
              <div className="p-8 md:p-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 shrink-0 ${activeTab.bg} rounded-2xl flex items-center justify-center`}>
                        <activeTab.icon className={`w-7 h-7 ${activeTab.color}`} />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900">{activeTab.title}</h2>
                    </div>
                    
                    {/* Overview Box */}
                    <div className="mb-8 border-l-4 border-purple-500 pl-4 py-1">
                      <p className="text-lg text-slate-700 font-medium italic">
                        {activeTab.short}
                      </p>
                    </div>

                    {/* Detailed Content */}
                    <div className="prose prose-slate max-w-none">
                      {activeTab.content}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Book spine decorative effect */}
              <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-slate-100 to-transparent pointer-events-none opacity-50 hidden md:block"></div>
            </div>
          </motion.div>
        </div>
        
        {/* Footer info box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between text-white shadow-xl"
        >
          <div className="mb-6 md:mb-0 max-w-xl text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">Bạn cần hỗ trợ thêm?</h3>
            <p className="text-slate-300">
              Đừng ngần ngại liên hệ với chúng tôi. Đội ngũ chăm sóc khách hàng luôn sẵn sàng giải đáp thắc mắc của bạn.
            </p>
          </div>
          <button className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg shrink-0 w-full md:w-auto">
            Liên hệ ngay
          </button>
        </motion.div>
      </div>
    </div>
  );
}
