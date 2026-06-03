// src/app/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, Lock, Mail, KeyRound, RefreshCw, CheckCircle, Loader2, Phone, CreditCard } from "lucide-react";
import { authApi } from "../api/authApi";

type PageStep = "login" | "signup" | "verify" | "forgot" | "resetPassword";

export function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<PageStep>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Handle OAuth2 redirect callback (?token=...&userId=...&role=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("userId");
    const role = params.get("role");
    if (token && userId && role) {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userRole", role);
      if (role === "ADMIN") window.location.href = "/admin";
      else if (role === "STAFF") window.location.href = "/staff";
      else window.location.href = "/";
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const res: any = await authApi.login({ email, password });
      const data = res?.data || res;
      if (data?.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", String(data.userId || ""));
        localStorage.setItem("userRole", data.role || "CUSTOMER");
        if (data.role === "ADMIN") window.location.href = "/admin";
        else if (data.role === "STAFF") window.location.href = "/staff";
        else window.location.href = "/";
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "";
      // Email chưa verify → chuyển sang bước verify
      if (msg.toLowerCase().includes("not verified") || msg.toLowerCase().includes("email is not verified")) {
        setStep("verify");
        setError("");
        setSuccess("Vui lòng xác minh email của bạn. Kiểm tra hộp thư và nhập mã OTP.");
      } else {
        setError(msg || "Email hoặc mật khẩu không đúng.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      await authApi.register({ email, password, fullName: name, phone, bankAccount });
      // Sau đăng ký → chuyển ngay sang bước verify OTP
      setStep("verify");
      setSuccess("Tài khoản đã tạo! Kiểm tra email để lấy mã OTP 6 số.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đăng ký thất bại. Email có thể đã tồn tại.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (otpCode.length !== 6) { setError("Mã OTP phải đúng 6 chữ số."); return; }
    setLoading(true);
    try {
      const res: any = await authApi.verifyEmail({ email, code: otpCode });
      const data = res?.data || res;
      if (data?.token) {
        // Backend trả token sau verify → login luôn
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", String(data.userId || ""));
        localStorage.setItem("userRole", data.role || "CUSTOMER");
        window.location.href = "/";
      } else {
        setSuccess("Email đã xác minh! Đang chuyển về đăng nhập...");
        setTimeout(() => { setStep("login"); setOtpCode(""); setSuccess(""); }, 1500);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || !email) return;
    setResending(true); setError(""); setSuccess("");
    try {
      await authApi.resendVerification({ email });
      setSuccess("Đã gửi lại mã OTP! Kiểm tra email của bạn.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể gửi lại mã.");
    } finally {
      setResending(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!email) { setError("Vui lòng nhập email."); return; }
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep("resetPassword");
      setOtpCode("");
      setSuccess("Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Email không tồn tại trong hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (otpCode.length !== 6) { setError("Mã OTP phải đúng 6 chữ số."); return; }
    if (newPassword.length < 6) { setError("Mật khẩu mới phải từ 6 ký tự."); return; }
    if (newPassword !== confirmPassword) { setError("Mật khẩu xác nhận không khớp."); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ email, code: otpCode, newPassword });
      setSuccess("Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...");
      setTimeout(() => {
        setStep("login");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setOtpCode("");
        setSuccess("");
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12 px-6 bg-gray-50">
      <div className="w-full max-w-md">

        {/* ── STEP: VERIFY EMAIL ── */}
        {step === "verify" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Xác minh Email</h2>
            <p className="text-gray-500 text-sm mb-6">
              Nhập mã <span className="font-semibold text-gray-700">6 chữ số</span> đã gửi đến{" "}
              <span className="font-semibold text-purple-600">{email}</span>
            </p>

            {success && (
              <div className="mb-4 flex items-center gap-2 justify-center text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify}>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="_ _ _ _ _ _"
                maxLength={6}
                className="w-full text-center text-3xl font-bold tracking-[0.5em] px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all mb-4"
              />
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-purple-200 mb-4"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang xác minh...</> : "Mác minh & Đăng nhập"}
              </button>
            </form>

            <button
              onClick={handleResend}
              disabled={resending}
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors mx-auto"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
              {resending ? "Đang gửi lại..." : "Gửi lại mã OTP"}
            </button>

            <button
              onClick={() => { setStep("login"); setError(""); setSuccess(""); }}
              className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors block mx-auto animate-pulse"
            >
              ← Quay về đăng nhập
            </button>
          </div>
        )}

        {/* ── STEP: FORGOT PASSWORD ── */}
        {step === "forgot" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Quên mật khẩu</h2>
            <p className="text-center text-gray-500 text-sm mb-6 font-medium">
              Nhập email đăng ký của bạn. Chúng tôi sẽ gửi mã OTP gồm 6 chữ số để đặt lại mật khẩu.
            </p>

            {error && (
              <div className="mb-4 text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2 justify-center text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <div className="mb-5">
                <label className="font-medium mb-2 block text-gray-700 text-sm">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-purple-200 mb-4"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang gửi...</> : "Gửi mã xác minh"}
              </button>
            </form>

            <button
              onClick={() => { setStep("login"); setError(""); setSuccess(""); }}
              className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors block mx-auto text-center"
            >
              ← Quay về đăng nhập
            </button>
          </div>
        )}

        {/* ── STEP: RESET PASSWORD ── */}
        {step === "resetPassword" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Đặt lại mật khẩu</h2>
            <p className="text-center text-gray-500 text-sm mb-6">
              Mã xác minh đã được gửi tới <span className="font-semibold text-purple-600">{email}</span>. Vui lòng nhập OTP và mật khẩu mới.
            </p>

            {error && (
              <div className="mb-4 text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2 justify-center text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="mb-5">
                <label className="font-medium mb-2 block text-gray-700 text-sm">Mã xác minh OTP</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Nhập mã OTP 6 số"
                  maxLength={6}
                  className="w-full text-center text-2xl font-bold tracking-[0.2em] px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all mb-4"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="font-medium mb-2 block text-gray-700 text-sm">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                    className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                    minLength={6}
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="mb-6">
                <label className="font-medium mb-2 block text-gray-700 text-sm">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu"
                    className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6 || !newPassword || newPassword !== confirmPassword}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-purple-200 mb-4"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang cập nhật...</> : "Đổi mật khẩu"}
              </button>
            </form>

            <button
              onClick={() => { setStep("login"); setError(""); setSuccess(""); }}
              className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors block mx-auto text-center"
            >
              ← Quay về đăng nhập
            </button>
          </div>
        )}

        {/* ── STEP: LOGIN / SIGNUP ── */}
        {step !== "verify" && step !== "forgot" && step !== "resetPassword" && (
          <>
            {/* Tab toggle */}
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => { setStep("login"); setError(""); setSuccess(""); }}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  step === "login"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => { setStep("signup"); setError(""); setSuccess(""); }}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  step === "signup"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                Đăng ký
              </button>
            </div>

            <form
              onSubmit={step === "login" ? handleLogin : handleSignup}
              className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
            >
              <h2 className="text-3xl font-bold mb-2 text-center text-gray-900">
                {step === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản"}
              </h2>
              <p className="text-center text-gray-500 text-sm mb-8">
                {step === "login"
                  ? "Đăng nhập để tiếp tục mua sắm"
                  : "Đăng ký để bắt đầu trải nghiệm"}
              </p>

              {error && (
                <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {success}
                </div>
              )}

              {/* Name field (signup only) */}
              {step === "signup" && (
                <div className="mb-5">
                  <label className="font-medium mb-2 block text-gray-700 text-sm">Họ và tên</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required={step === "signup"}
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              )}

              {/* Phone field (signup only) */}
              {step === "signup" && (
                <div className="mb-5">
                  <label className="font-medium mb-2 block text-gray-700 text-sm">Số điện thoại</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09XXXXXXXX"
                      className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required={step === "signup"}
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              )}

              {/* Bank account field (signup only) */}
              {step === "signup" && (
                <div className="mb-5">
                  <label className="font-medium mb-2 block text-gray-700 text-sm">Số tài khoản ngân hàng (để hoàn tiền cọc)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="Tên ngân hàng + Số tài khoản"
                      className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required={step === "signup"}
                    />
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="mb-5">
                <label className="font-medium mb-2 block text-gray-700 text-sm">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Password */}
              <div className="mb-5">
                <label className="font-medium mb-2 block text-gray-700 text-sm">Mật khẩu</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={step === "signup" ? "Tối thiểu 6 ký tự" : "Nhập mật khẩu"}
                    className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                    minLength={step === "signup" ? 6 : undefined}
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {step === "login" && (
                <div className="mb-6 flex justify-between items-center text-sm">
                  <button
                    type="button"
                    onClick={() => { setStep("verify"); setOtpCode(""); setError(""); setSuccess("Nhập mã OTP từ email của bạn."); }}
                    className="text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    Xác minh tài khoản?
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep("forgot"); setError(""); setSuccess(""); }}
                    className="text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-purple-200 mb-6"
              >
                {loading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...</>
                  : step === "login" ? "Đăng nhập" : "Tạo tài khoản"
                }
              </button>

              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  {step === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                  <button
                    type="button"
                    onClick={() => { setStep(step === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
                    className="font-semibold text-purple-600 hover:underline"
                  >
                    {step === "login" ? "Đăng ký ngay" : "Đăng nhập"}
                  </button>
                </p>
              </div>
            </form>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-gray-50 px-4 text-sm text-gray-500">Hoặc tiếp tục với</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => authApi.oauth2Google()}
                className="w-full bg-white border border-gray-200 py-3 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Tiếp tục với Google
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}