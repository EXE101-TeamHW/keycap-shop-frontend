import { useState, useEffect, useCallback } from "react";
import { Users, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { toast } from "sonner";

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    adminApi.getUsersPaged(page, 10).then((res: any) => {
      const pageData = res?.data || res || {};
      setUsers(Array.isArray(pageData.content) ? pageData.content : []);
      setTotalPages(Math.max(1, Number(pageData.totalPages || 1)));
      setTotalUsers(Number(pageData.totalElements || 0));
    }).catch(console.error).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = (userId: string, newRole: string) => {
    adminApi.updateUserRole(userId, newRole).then(() => {
      toast.success("Đã cập nhật vai trò người dùng!");
      fetchUsers();
    }).catch(() => toast.error("Có lỗi xảy ra"));
  };

  const toggleUserStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    adminApi.updateUserStatus(userId, newStatus).then(() => {
      toast.success(`Đã chuyển trạng thái sang ${newStatus}`);
      fetchUsers();
    }).catch(() => toast.error("Có lỗi xảy ra"));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Quản lý người dùng ({totalUsers})
        </h3>
      </div>
      <div className="p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {["ID", "Tên", "Email", "Vai trò", "Trạng thái", "Ngày tham gia"].map((h) => (
                <th key={h} className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 font-medium text-gray-900 text-sm">{user.id}</td>
                <td className="py-4 px-4 text-gray-900 text-sm">{user.fullName || user.email}</td>
                <td className="py-4 px-4 text-gray-600 text-sm">{user.email}</td>
                <td className="py-4 px-4">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold border border-gray-200 bg-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="STAFF">STAFF</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                  </select>
                </td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => toggleUserStatus(user.id, user.status)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold hover:opacity-80 transition-opacity ${
                      user.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.status || "ACTIVE"}
                  </button>
                </td>
                <td className="py-4 px-4 text-gray-600 text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải danh sách người dùng...
          </div>
        )}
        {!loading && users.length === 0 && (
          <div className="text-center py-12 text-gray-400">Không có người dùng nào</div>
        )}
        {!loading && totalUsers > 0 && (
          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-500">Trang {page + 1}/{totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((value) => Math.max(0, value - 1))}
                disabled={page === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Trước
              </button>
              <button
                onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
                disabled={page >= totalPages - 1}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Sau <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
