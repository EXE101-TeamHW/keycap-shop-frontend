import { useState } from "react";
import { ArrowLeft, Clock, User, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const mockNewsList = [
  {
    id: 1,
    title: "Xu hướng Keycap năm 2026: Sự lên ngôi của các profile mới",
    date: "26/05/2026",
    author: "Admin",
    category: "Xu hướng",
    summary: "Cùng tìm hiểu xem năm nay cộng đồng phím cơ đang ưa chuộng các thiết kế và profile keycap nào nhé.",
    image: "https://loremflickr.com/800/600/keyboard,tech?lock=10",
    content: "Trong năm 2026, thế giới phím cơ chứng kiến sự trở lại mạnh mẽ của các profile keycap cổ điển nhưng được cách tân với màu sắc rực rỡ hơn. Người dùng đang dần chuyển từ các profile Cherry quen thuộc sang các profile cao hơn như SA, MT3 để tối ưu hóa trải nghiệm gõ phím. Bên cạnh đó, chất liệu nhựa PBT vân nhám tiếp tục thống trị nhờ độ bền và khả năng chống bóng tuyệt vời. Các nhà sản xuất cũng bắt đầu thử nghiệm với các loại nhựa resin trong suốt để kết hợp hoàn hảo với hệ thống LED RGB."
  },
  {
    id: 2,
    title: "Hướng dẫn vệ sinh Keycap đúng cách tại nhà",
    date: "15/05/2026",
    author: "Tech Guru",
    category: "Mẹo vặt",
    summary: "Keycap bám bẩn sau thời gian dài sử dụng là điều không tránh khỏi. Bài viết này sẽ hướng dẫn bạn cách làm sạch chúng an toàn.",
    image: "https://loremflickr.com/800/600/keyboard,clean?lock=2",
    content: "Vệ sinh keycap định kỳ không chỉ giúp bàn phím của bạn luôn trông như mới mà còn kéo dài tuổi thọ của chúng. Đầu tiên, bạn cần dùng keypuller để tháo toàn bộ keycap ra. Tuyệt đối không dùng tay giật mạnh vì có thể làm gãy stem của switch. Sau đó, ngâm keycap trong nước ấm pha chút xà phòng nhẹ (như nước rửa chén) trong khoảng 30 phút. Dùng bàn chải lông mềm hoặc cọ trang điểm để chà nhẹ từng phím. Xả sạch với nước và để khô tự nhiên trong ít nhất 24 giờ trước khi lắp lại. Không dùng máy sấy nhiệt độ cao vì có thể làm biến dạng nhựa."
  },
  {
    id: 3,
    title: "PBT vs ABS: Đâu là chất liệu phù hợp với bạn?",
    date: "02/05/2026",
    author: "Reviewer",
    category: "Kiến thức",
    summary: "So sánh chi tiết hai loại nhựa phổ biến nhất trong sản xuất keycap để giúp bạn đưa ra lựa chọn phù hợp.",
    image: "https://loremflickr.com/800/600/keyboard,plastic?lock=3",
    content: "Khi chọn mua keycap, chất liệu luôn là yếu tố được cân nhắc đầu tiên. Nhựa ABS (Acrylonitrile Butadiene Styrene) có ưu điểm là màu sắc tươi tắn, dễ đúc các chi tiết phức tạp và giá thành thường rẻ hơn. Tuy nhiên, ABS dễ bị bóng (shine) sau một thời gian sử dụng do ma sát. Trong khi đó, nhựa PBT (Polybutylene Terephthalate) cứng hơn, chịu nhiệt tốt hơn và đặc biệt là không bị bóng. Cảm giác gõ trên PBT thường đầm và âm thanh trầm hơn. Điểm trừ của PBT là màu sắc không đa dạng và sặc sỡ bằng ABS, đồng thời chi phí sản xuất cũng cao hơn."
  },
  {
    id: 4,
    title: "Top 5 bộ Keycap Custom được săn lùng nhất",
    date: "20/04/2026",
    author: "Collector",
    category: "Đánh giá",
    summary: "Điểm danh 5 bộ keycap custom phiên bản giới hạn đang làm mưa làm gió trên các diễn đàn phím cơ.",
    image: "https://loremflickr.com/800/600/keyboard,custom?lock=4",
    content: "Thị trường keycap custom ngày càng sôi động với sự xuất hiện của vô số bộ sưu tập độc đáo. Đứng đầu danh sách năm nay là bộ 'Cyberpunk 2026' với tông màu neon rực rỡ và các ký tự được thiết kế theo phong cách futuristic. Tiếp theo là 'Retro Mac' mang cảm hứng từ những chiếc máy tính thập niên 90. Ở vị trí thứ ba là bộ 'Matcha Garden' nhẹ nhàng, thanh lịch. Thứ tư là 'Deep Ocean' với các sắc độ xanh dương chuyển đổi mượt mà. Cuối cùng là bộ 'Midnight Stealth' đen tuyền, tối giản nhưng cực kỳ cuốn hút."
  },
  {
    id: 5,
    title: "Artisan Keycap: Nghệ thuật thu nhỏ trên những phím bấm",
    date: "10/04/2026",
    author: "Artist",
    category: "Nghệ thuật",
    summary: "Khám phá thế giới của những chiếc keycap được làm hoàn toàn thủ công với độ tinh xảo đáng kinh ngạc.",
    image: "https://loremflickr.com/800/600/keyboard,artisan?lock=5",
    content: "Artisan keycap không chỉ đơn thuần là phụ kiện bàn phím mà đã trở thành những tác phẩm nghệ thuật thực thụ. Mỗi chiếc artisan đều được đúc, sơn và hoàn thiện hoàn toàn bằng tay, đòi hỏi sự tỉ mỉ và kiên nhẫn tột độ từ người thợ. Từ những hình thù dễ thương như con vật, đồ ăn, cho đến những chi tiết phức tạp như phong cảnh thu nhỏ, quái vật thần thoại... tất cả đều có thể được gói gọn trong một không gian chỉ khoảng 1 cm vuông. Mức giá cho một chiếc artisan có thể dao động từ vài trăm ngàn đến vài triệu đồng, tùy thuộc vào độ phức tạp và tên tuổi của maker."
  },
  {
    id: 6,
    title: "Cách chọn layout Keycap phù hợp với bàn phím của bạn",
    date: "28/03/2026",
    author: "Admin",
    category: "Hướng dẫn",
    summary: "Đừng để rơi vào tình cảnh mua bộ keycap đắt tiền về nhưng lại không lắp vừa bàn phím. Đọc ngay bài viết này!",
    image: "https://loremflickr.com/800/600/keyboard,layout?lock=6",
    content: "Một trong những rắc rối lớn nhất của người mới chơi phím cơ là chọn nhầm layout keycap. Bàn phím cơ hiện nay có rất nhiều kích cỡ: Fullsize (104/108 phím), TKL (87 phím), 75%, 65%, 60%... Mỗi kích cỡ lại có những biến thể về kích thước phím, đặc biệt là hàng phím dưới cùng (bottom row) và phím Shift. Trước khi mua, bạn cần xác định rõ bàn phím của mình thuộc layout nào, độ dài của phím Spacebar (thường là 6.25u hoặc 7u), và kích thước các phím modifier (Ctrl, Alt, Win). Tốt nhất là chọn những bộ keycap 'Base Kit' có số lượng phím lớn (140+ phím) để đảm bảo khả năng tương thích cao nhất."
  },
  {
    id: 7,
    title: "Lịch sử thú vị đằng sau các ký tự trên Keycap",
    date: "15/03/2026",
    author: "Historian",
    category: "Kiến thức",
    summary: "Tìm hiểu nguồn gốc và ý nghĩa của những ký tự kỳ lạ xuất hiện trên các bộ keycap vintage.",
    image: "https://loremflickr.com/800/600/keyboard,vintage?lock=7",
    content: "Bên cạnh các bảng chữ cái thông thường, nhiều bộ keycap vintage hoặc mang phong cách retro thường xuất hiện những ký tự rất độc đáo (gọi là sub-legends). Đó có thể là chữ cái tiếng Nhật (Hiragana/Katakana), tiếng Hàn (Hangul), tiếng Nga (Cyrillic), hoặc thậm chí là các ký hiệu toán học, runic cổ đại. Nguồn gốc của chúng bắt nguồn từ những chiếc máy đánh chữ hoặc trạm máy tính từ thời kỳ Chiến tranh Lạnh, khi mà bàn phím cần phục vụ cho nhiều ngôn ngữ hoặc mục đích chuyên dụng khác nhau. Ngày nay, việc thêm sub-legends chủ yếu mang tính chất trang trí, tạo điểm nhấn thẩm mỹ cho tổng thể bộ keycap."
  },
  {
    id: 8,
    title: "Double-shot vs Dye-sub: Công nghệ in nào tốt hơn?",
    date: "05/03/2026",
    author: "Tech Guru",
    category: "Kiến thức",
    summary: "Hai công nghệ in keycap phổ biến nhất hiện nay có gì khác biệt? Hãy cùng so sánh.",
    image: "https://loremflickr.com/800/600/keyboard,typing?lock=8",
    content: "Double-shot là công nghệ đúc keycap từ hai lớp nhựa riêng biệt, một lớp tạo hình phím và một lớp tạo hình ký tự. Nhờ đó, ký tự trên keycap double-shot sẽ không bao giờ bị mờ đi dù bạn sử dụng bao lâu. Tuy nhiên, công nghệ này đòi hỏi khuôn đúc đắt tiền nên giá thành sản phẩm thường cao. Ngược lại, Dye-sub (Dye-sublimation) là phương pháp dùng nhiệt để ép mực thấm sâu vào bề mặt nhựa. Dye-sub cho phép in nhiều màu sắc và hình ảnh phức tạp với chi phí thấp hơn, nhưng chỉ thực hiện được trên nhựa sáng màu và mực tối màu. Nhìn chung, Double-shot bền bỉ tuyệt đối, còn Dye-sub lại đa dạng và linh hoạt hơn về mặt thẩm mỹ."
  },
  {
    id: 9,
    title: "Sự kết hợp hoàn hảo: Switch và Keycap ảnh hưởng thế nào đến âm thanh?",
    date: "20/02/2026",
    author: "Audiophile",
    category: "Đánh giá",
    summary: "Âm thanh gõ phím không chỉ phụ thuộc vào switch mà keycap cũng đóng vai trò vô cùng quan trọng.",
    image: "https://loremflickr.com/800/600/keyboard,switch?lock=9",
    content: "Nếu bạn đang theo đuổi âm thanh 'thock' trầm đục hoặc 'clack' đanh sắc, bạn cần biết cách kết hợp giữa switch và keycap. Keycap có profile cao (như SA, MT3) và chất liệu nhựa dày sẽ tạo ra buồng âm lớn, mang lại âm thanh trầm, vang và 'thock' hơn. Ngược lại, keycap profile thấp (Cherry, DSA) với chất liệu mỏng hoặc nhựa ABS thường tạo ra âm thanh đanh, sắc và 'clack' hơn. Bề mặt keycap cũng ảnh hưởng đôi chút: nhựa nhám tạo âm thanh khác với nhựa bóng mượt. Do đó, việc thay đổi một bộ keycap mới không chỉ khoác 'áo mới' cho bàn phím mà còn thay đổi hoàn toàn trải nghiệm thính giác của bạn."
  }
];

export function News() {
  const [selectedArticle, setSelectedArticle] = useState<typeof mockNewsList[0] | null>(null);

  // Scroll to top when an article is selected
  const handleSelectArticle = (article: typeof mockNewsList[0]) => {
    setSelectedArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <AnimatePresence mode="wait">
        {!selectedArticle ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-slate-900 text-white py-20 px-6 text-center border-b-2 border-slate-900">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Tin tức & <span className="text-pink-500">Sự kiện</span></h1>
              <p className="text-slate-300 max-w-2xl mx-auto">Cập nhật những thông tin mới nhất về thế giới phím cơ và keycap.</p>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mockNewsList.map((news) => (
                  <div key={news.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="h-48 overflow-hidden relative group cursor-pointer" onClick={() => handleSelectArticle(news)}>
                      <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        {news.category}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                        <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {news.date}</span>
                        <span className="flex items-center gap-1"><User className="w-4 h-4" /> {news.author}</span>
                      </div>
                      <h3 
                        className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 cursor-pointer hover:text-purple-600 transition-colors"
                        onClick={() => handleSelectArticle(news)}
                      >
                        {news.title}
                      </h3>
                      <p className="text-slate-600 mb-6 line-clamp-3 flex-grow">{news.summary}</p>
                      <button 
                        onClick={() => handleSelectArticle(news)}
                        className="self-start text-slate-900 font-bold border-b-2 border-slate-900 pb-1 hover:text-purple-600 hover:border-purple-600 transition-colors"
                      >
                        Đọc tiếp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto px-6 py-12"
          >
            <button 
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-purple-600 font-semibold mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Trở lại danh sách
            </button>
            
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
              <div className="h-64 md:h-96 relative">
                <img src={selectedArticle.image} className="w-full h-full object-cover" alt={selectedArticle.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-8">
                  <div>
                    <span className="bg-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-4 inline-block shadow-md">
                      {selectedArticle.category}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                      {selectedArticle.title}
                    </h1>
                  </div>
                </div>
              </div>
              
              <div className="p-8 md:p-12">
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100 font-medium">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" /> 
                    Tác giả: <span className="text-slate-900">{selectedArticle.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-purple-600" /> 
                    Đăng ngày: <span className="text-slate-900">{selectedArticle.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" /> 
                    Thời gian đọc: <span className="text-slate-900">3 phút</span>
                  </div>
                </div>
                
                <div className="prose prose-lg prose-slate max-w-none">
                  <p className="text-xl text-slate-600 italic font-medium leading-relaxed mb-8">
                    {selectedArticle.summary}
                  </p>
                  
                  <div className="text-slate-800 leading-loose">
                    {selectedArticle.content.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-6">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
