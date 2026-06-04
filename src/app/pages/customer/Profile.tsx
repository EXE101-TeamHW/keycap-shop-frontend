// src/app/pages/Profile.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  User, Mail, Phone, Camera, Save, Loader2, ArrowLeft,
  Package, ClipboardList, Shield, CheckCircle, Edit3, AlertCircle,
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

interface BankOption {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo?: string;
}

const PHONE_PATTERN = /^(03|05|08|09)\d{8}$/;

const parseBankAccount = (value?: string) => {
  const parts = (value || "").split(" - ").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return {
      bankShortName: parts[0],
      bankAccountNumber: parts[1],
      bankAccountName: parts.slice(2).join(" - "),
    };
  }
  return { bankShortName: "", bankAccountNumber: value || "", bankAccountName: "" };
};

const buildBankAccount = (form: {
  bankShortName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}) => {
  if (!form.bankShortName && !form.bankAccountNumber && !form.bankAccountName) return "";
  return `${form.bankShortName} - ${form.bankAccountNumber} - ${form.bankAccountName}`.trim();
};

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
  const [error, setError] = useState("");
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    avatarUrl: "",
    bankAccount: "",
    bankShortName: "",
    bankAccountNumber: "",
    bankAccountName: "",
  });

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) { navigate("/login"); return; }
    axiosClient.get(`/auth/me?userId=${userId}`)
      .then((res: any) => {
        const data = res?.data || res;
        const parsedBankAccount = parseBankAccount(data.bankAccount);
        setUser(data);
        setForm({
          fullName: data.fullName || "",
          phone: data.phone || "",
          avatarUrl: data.avatarUrl || "",
          bankAccount: data.bankAccount || "",
          bankShortName: parsedBankAccount.bankShortName,
          bankAccountNumber: parsedBankAccount.bankAccountNumber,
          bankAccountName: parsedBankAccount.bankAccountName,
        });
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
    setLoadingBanks(true);
    fetch("https://api.vietqr.io/v2/banks")
      .then((res) => res.json())
      .then((res) => {
        const bankList = Array.isArray(res?.data) ? res.data : [];
        setBanks(
          bankList
            .filter((bank: BankOption) => bank.shortName && bank.name)
            .sort((a: BankOption, b: BankOption) => a.shortName.localeCompare(b.shortName))
        );
      })
      .catch(() => {
        setBanks([]);
      })
      .finally(() => setLoadingBanks(false));
  }, []);

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

  const resetForm = (profile: UserProfile) => {
    const parsedBankAccount = parseBankAccount(profile.bankAccount);
    setForm({
      fullName: profile.fullName || "",
      phone: profile.phone || "",
      avatarUrl: profile.avatarUrl || "",
      bankAccount: profile.bankAccount || "",
      bankShortName: parsedBankAccount.bankShortName,
      bankAccountNumber: parsedBankAccount.bankAccountNumber,
      bankAccountName: parsedBankAccount.bankAccountName,
    });
  };

  const handleSave = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    if (form.phone && !PHONE_PATTERN.test(form.phone)) {
      setSaved(false);
      setError("Số điện thoại không đúng định dạng");
      return;
    }
    const hasBankInfo = Boolean(form.bankShortName || form.bankAccountNumber || form.bankAccountName);
    if (hasBankInfo && (!form.bankShortName || !form.bankAccountNumber || !form.bankAccountName.trim())) {
      setSaved(false);
      setError("Vui lòng chọn ngân hàng, nhập số tài khoản và tên chủ tài khoản.");
      return;
    }
    const profilePayload = {
      fullName: form.fullName,
      phone: form.phone,
      avatarUrl: form.avatarUrl,
      bankAccount: buildBankAccount({
        bankShortName: form.bankShortName,
        bankAccountNumber: form.bankAccountNumber,
        bankAccountName: form.bankAccountName.trim(),
      }),
    };
    setSaving(true);
    setError("");
    try {
      const res: any = await axiosClient.put(`/auth/profile`, profilePayload);
      const updated = res?.data || res;
      setUser(updated);
      // Sync localStorage
      if (updated.fullName) localStorage.setItem("fullName", updated.fullName);
      if (updated.avatarUrl) localStorage.setItem("avatarUrl", updated.avatarUrl);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Cập nhật thất bại.");
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
  const displayBankAccount = parseBankAccount(user.bankAccount);

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
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
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
              onClick={() => { setEditing(false); setError(""); resetForm(user); }}
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
                  onChange={(e) => {
                    setError("");
                    setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }));
                  }}
                  placeholder="0xxxxxxxxx"
                  inputMode="numeric"
                  maxLength={10}
                  pattern="(03|05|08|09)[0-9]{8}"
                  title="Số điện thoại phải gồm 10 số và bắt đầu bằng 03, 05, 08 hoặc 09"
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
              <div className="space-y-3">
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={form.bankShortName}
                    onChange={(e) => {
                      const selected = banks.find((bank) => bank.shortName === e.target.value);
                      setError("");
                      setForm(f => ({
                        ...f,
                        bankShortName: selected?.shortName || "",
                        bankAccount: buildBankAccount({
                          bankShortName: selected?.shortName || "",
                          bankAccountNumber: f.bankAccountNumber,
                          bankAccountName: f.bankAccountName,
                        }),
                      }));
                    }}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">{loadingBanks ? "Đang tải danh sách ngân hàng..." : "Chọn ngân hàng"}</option>
                    {banks.map((bank) => (
                      <option key={`${bank.bin}-${bank.shortName}`} value={bank.shortName}>
                        {bank.shortName} - {bank.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.bankAccountNumber}
                    onChange={(e) => {
                      const bankAccountNumber = e.target.value.replace(/\D/g, "");
                      setError("");
                      setForm(f => ({
                        ...f,
                        bankAccountNumber,
                        bankAccount: buildBankAccount({
                          bankShortName: f.bankShortName,
                          bankAccountNumber,
                          bankAccountName: f.bankAccountName,
                        }),
                      }));
                    }}
                    inputMode="numeric"
                    placeholder="Số tài khoản"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.bankAccountName}
                    onChange={(e) => {
                      const bankAccountName = e.target.value.toUpperCase();
                      setError("");
                      setForm(f => ({
                        ...f,
                        bankAccountName,
                        bankAccount: buildBankAccount({
                          bankShortName: f.bankShortName,
                          bankAccountNumber: f.bankAccountNumber,
                          bankAccountName,
                        }),
                      }));
                    }}
                    placeholder="Tên chủ tài khoản"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ngân hàng</div>
                    <div className="text-gray-700">
                      {displayBankAccount.bankShortName || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                    </div>
                  </div>
                </div>
                <div className="pl-7">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Số tài khoản</div>
                  <div className="text-gray-700">
                    {displayBankAccount.bankAccountNumber || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                  </div>
                </div>
                <div className="pl-7">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tên chủ tài khoản</div>
                  <div className="text-gray-700">
                    {displayBankAccount.bankAccountName || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                  </div>
                </div>
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
