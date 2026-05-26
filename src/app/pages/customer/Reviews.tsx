import { Star, MessageCircle, ShieldCheck, HeartHandshake } from "lucide-react";
import { useEffect, useState } from "react";
import { reviewApi, ReviewResponse } from "../../api/reviewApi";
import { motion } from "motion/react";

export function Reviews() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewApi.listAll()
      .then((res) => {
        // Sort by newest first
        const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReviews(sorted);
      })
      .catch((err) => {
        console.error("Failed to fetch reviews", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : "0.0";
  const satisfiedCount = reviews.filter(r => r.rating >= 3).length;
  const satisfactionRate = totalReviews > 0 ? Math.round((satisfiedCount / totalReviews) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-50"
    >
      <div className="bg-slate-900 text-white py-20 px-6 text-center border-b-2 border-slate-900">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
          Đánh giá từ <span className="text-yellow-400">Khách hàng</span>
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Niềm tin của khách hàng là thước đo cho chất lượng dịch vụ của chúng tôi.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Thống kê & Hỗ trợ 24/7 */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <h2 className="font-bold text-slate-900 text-xl mb-4">Tổng quan đánh giá</h2>
              <div className="text-6xl font-black text-slate-900 mb-2">{avgRating}</div>
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-6 h-6 ${star <= Math.round(Number(avgRating)) ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-200'}`} />
                ))}
              </div>
              <p className="text-slate-500 font-medium mb-6">Dựa trên {totalReviews} đánh giá</p>
              
              <div className="h-px bg-slate-100 mb-6"></div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Tỉ lệ hài lòng</span>
                <span className="text-green-500 font-bold text-lg">{satisfactionRate}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2 overflow-hidden">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${satisfactionRate}%` }}></div>
              </div>
            </div>

            {/* Hỗ trợ 24/7 Box */}
            <div className="bg-purple-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
              <HeartHandshake className="w-10 h-10 mb-4" />
              <h2 className="font-bold text-xl mb-2">Hỗ trợ 24/7</h2>
              <p className="text-purple-100 text-sm mb-4">
                Chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn bất cứ lúc nào!
              </p>
              <button className="w-full bg-white text-purple-600 font-bold uppercase tracking-wider text-sm py-3 rounded-xl hover:bg-slate-50 transition-colors">
                Liên hệ ngay
              </button>
            </div>
          </div>

          {/* Danh sách đánh giá */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
                <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Chưa có đánh giá nào</h3>
                <p className="text-slate-500">Hãy là người đầu tiên trải nghiệm và để lại nhận xét nhé!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    key={review.id} 
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                        {review.userName ? review.userName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{review.userName || "Khách hàng ẩn danh"}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-green-500" />
                          Đã mua hàng
                        </p>
                      </div>
                      <div className="ml-auto text-xs text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-slate-700 italic flex-1">"{review.comment}"</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
