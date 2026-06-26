import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, MessageSquareText, Search, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../../api/adminApi";
import type { ReviewResponse } from "../../api/reviewApi";

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function ReviewManagement() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("ALL");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewResponse | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res: any = await adminApi.getReviews();
      const data = res?.data || res || [];
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi-VN");
    return reviews.filter((review) => {
      const matchesRating = rating === "ALL" || review.rating === Number(rating);
      const matchesSearch =
        !keyword ||
        [review.userName, review.productName, review.comment, review.orderId?.toString()]
          .filter(Boolean)
          .some((value) => String(value).toLocaleLowerCase("vi-VN").includes(keyword));
      return matchesRating && matchesSearch;
    });
  }, [rating, reviews, search]);

  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0;

  const handleDelete = async (review: ReviewResponse) => {
    setDeletingId(review.id);
    try {
      await adminApi.deleteReview(review.id);
      setReviews((current) => current.filter((item) => item.id !== review.id));
      toast.success("Đã xóa đánh giá.");
      setReviewToDelete(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể xóa đánh giá.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <MessageSquareText className="h-4 w-4" />
          Quản trị nội dung
        </div>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Đánh giá sản phẩm</h1>
        <p className="mt-1 text-sm text-slate-500">Theo dõi phản hồi và xử lý đánh giá không phù hợp.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Tổng đánh giá</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{loading ? "..." : reviews.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Điểm trung bình</p>
          <p className="mt-2 flex items-center gap-2 text-3xl font-black text-slate-950">
            {loading ? "..." : averageRating.toFixed(1)}
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Đánh giá 5 sao</p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {loading ? "..." : reviews.filter((review) => review.rating === 5).length}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm khách hàng, sản phẩm, nội dung hoặc mã đơn..."
              className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-slate-900"
            />
          </label>
          <select
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="ALL">Tất cả số sao</option>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} sao</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Số sao</th>
                <th className="px-4 py-3">Nội dung</th>
                <th className="px-4 py-3">Ngày / giờ</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review.id} className="border-b border-slate-100 align-top hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                        {review.productImage ? <img src={review.productImage} alt="" className="h-full w-full object-cover" /> : null}
                      </div>
                      <div>
                        <p className="max-w-48 truncate font-bold text-slate-900">{review.productName || "Sản phẩm đã xóa"}</p>
                        <p className="mt-1 text-xs text-slate-500">Đơn #{review.orderId || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{review.userName || "Khách hàng"}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star key={value} className={`h-4 w-4 ${value <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                      ))}
                    </div>
                  </td>
                  <td className="max-w-sm px-4 py-4 leading-6 text-slate-600">{review.comment || "Không có nhận xét"}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-slate-500">
                    {review.createdAt ? formatDateTime(review.createdAt) : "-"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      disabled={deletingId === review.id}
                      onClick={() => setReviewToDelete(review)}
                      title="Xóa đánh giá"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center font-semibold text-slate-400">Không có đánh giá phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reviewToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => !deletingId && setReviewToDelete(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-review-title"
            className="w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-4 border-b border-slate-100 bg-red-50 px-6 py-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="delete-review-title" className="text-lg font-bold text-slate-950">
                  Xóa đánh giá này?
                </h2>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  Đánh giá sẽ bị xóa vĩnh viễn và không thể khôi phục.
                </p>
              </div>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setReviewToDelete(null)}
                title="Đóng"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">
                      {reviewToDelete.userName || "Khách hàng"}
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                      {reviewToDelete.productName || "Sản phẩm"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={`h-4 w-4 ${
                          value <= reviewToDelete.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                  {reviewToDelete.comment || "Không có nhận xét"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setReviewToDelete(null)}
                className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Giữ đánh giá
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => handleDelete(reviewToDelete)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deletingId ? "Đang xóa..." : "Xóa đánh giá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
