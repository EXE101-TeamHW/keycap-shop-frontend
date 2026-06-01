// src/app/pages/Profile.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  User, Mail, Phone, Camera, Save, Loader2, ArrowLeft,
  Package, ClipboardList, Shield, CheckCircle, Edit3,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { uploadApi } from "../../api/uploadApi";

interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  role: string;
  status: string;
  createdAt: string;
  bankAccount?: string;
}

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  ADMIN: { label: "Admin", color: "bg-red-100 text-red-700" },
  STAFF: { label: "Staff / Designer", color: "bg-blue-100 text-blue-700" },
  CUSTOMER: { label: "Khách hàng", color: "bg-purple-100 text-purple-700" },
};

export function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({ fullName: "", phone: "", avatarUrl: "", bankAccount: "" });

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) { navigate("/login"); return; }
    axiosClient.get(`/auth/me?userId=${userId}`)
      .then((res: any) => {
        const data = res?.data || res;
        setUser(data);
        setForm({
          fullName: data.fullName || "",
          phone: data.phone || "",
          avatarUrl: data.avatarUrl || "",
          bankAccount: data.bankAccount || "",
        });
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const res: any = await uploadApi.uploadFile(file);
      const url = res?.data?.url || res?.url || res;
      setForm(f => ({ ...f, avatarUrl: url }));
    } catch { alert("Upload ảnh thất bại."); }
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    setSaving(true);
    try {
      const res: any = await axiosClient.put(`/auth/profile`, form);
      const updated = res?.data || res;
      setUser(updated);
      // Sync localStorage
      if (updated.fullName) localStorage.setItem("fullName", updated.fullName);
      if (updated.avatarUrl) localStorage.setItem("avatarUrl", updated.avatarUrl);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Cập nhật thất bại.");
    }
    setSaving(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const roleBadge = ROLE_BADGE[user.role] || { label: user.role, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-800 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Trang chủ
      </button>

      {/* Header card */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-8 -translate-x-8" />
        <div className="relative flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white/20 overflow-hidden border-2 border-white/40">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white/70" />
                </div>
              )}
            </div>
            {editing && (
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-100 transition-colors">
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                ) : (
                  <Camera className="w-4 h-4 text-purple-600" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl font-black truncate">{user.fullName || "Chưa đặt tên"}</div>
            <div className="text-white/80 text-sm">{user.email}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white`}>
                {roleBadge.label}
              </span>
              <span className="text-xs text-white/70">
                Tham gia {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long" }) : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {saved && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-4 text-sm font-semibold">
          <CheckCircle className="w-4 h-4" /> Cập nhật thông tin thành công!
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-purple-600" /> Thông tin cá nhân
          </h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
            >
              Chỉnh sửa
            </button>
          ) : (
            <button
              onClick={() => { setEditing(false); setForm({ fullName: user.fullName || "", phone: user.phone || "", avatarUrl: user.avatarUrl || "", bankAccount: user.bankAccount || "" }); }}
              className="text-sm text-gray-500 hover:text-gray-700 font-semibold"
            >
              Hủy
            </button>
          )}
        </div>
        <div className="p-5 space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">{user.email}</span>
              <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Không thể thay đổi
              </span>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Họ và tên</label>
            {editing ? (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Nhập họ và tên..."
                  className="w-full pl-11 pr-4 py-3 bg-white border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{user.fullName || <span className="text-gray-400 italic">Chưa cập nhật</span>}</span>
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Số điện thoại</label>
            {editing ? (
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="0xxxxxxxxx"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{user.phone || <span className="text-gray-400 italic">Chưa cập nhật</span>}</span>
              </div>
            )}
          </div>

          {/* Bank Account */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Số tài khoản ngân hàng (Hoàn tiền)</label>
            {editing ? (
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.bankAccount}
                  onChange={(e) => setForm(f => ({ ...f, bankAccount: e.target.value }))}
                  placeholder="Ví dụ: VCB 10123... - NGUYEN VAN A"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{user.bankAccount || <span className="text-gray-400 italic">Chưa cung cấp (Sẽ dùng khi hoàn tiền)</span>}</span>
              </div>
            )}
          </div>

          {/* Save Button */}
          {editing && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-60 mt-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/orders")}
          className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 hover:border-purple-300 hover:bg-purple-50 transition-all group"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors">
            <Package className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
          </div>
          <div className="text-left">
            <div className="font-bold text-gray-900 text-sm">Đơn hàng</div>
            <div className="text-xs text-gray-500">Xem lịch sử</div>
          </div>
        </button>
        <button
          onClick={() => navigate("/my-tickets")}
          className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 hover:border-pink-300 hover:bg-pink-50 transition-all group"
        >
          <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center group-hover:bg-pink-600 transition-colors">
            <ClipboardList className="w-5 h-5 text-pink-600 group-hover:text-white transition-colors" />
          </div>
          <div className="text-left">
            <div className="font-bold text-gray-900 text-sm">Ticket Custom</div>
            <div className="text-xs text-gray-500">Xem tiến độ</div>
          </div>
        </button>
      </div>
    </div>
  );
}
