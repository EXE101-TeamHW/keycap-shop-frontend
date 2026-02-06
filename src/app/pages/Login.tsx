// src/app/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Lock, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { AuthService } from "../data/users";

export function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = AuthService.register({
          email,
          password,
          name,
          role: 'customer'
        });

        if (result.success) {
          setSuccess("Đăng ký thành công! Đang chuyển hướng...");
          setTimeout(() => navigate("/"), 1500);
        } else {
          setError(result.message || "Đăng ký thất bại");
        }
      } else {
        const result = AuthService.login(email, password);

        if (result.success) {
          setSuccess("Đăng nhập thành công! Đang chuyển hướng...");
          setTimeout(() => navigate("/"), 1500);
        } else {
          setError(result.message || "Đăng nhập thất bại");
        }
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12 px-6 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="w-full max-w-md">
        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              !isSignUp
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              isSignUp
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Demo Accounts */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Tài khoản demo:</h3>
          <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <div><strong>Admin:</strong> admin@hwshop.com / admin123</div>
            <div><strong>Staff:</strong> staff@hwshop.com / staff123</div>
            <div><strong>Customer:</strong> customer@gmail.com / customer123</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
            {isSignUp ? "Tạo tài khoản" : "Chào mừng trở lại"}
          </h2>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {isSignUp && (
            <div className="mb-5">
              <label className="font-medium mb-2 block text-gray-700 dark:text-gray-300">Họ tên</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ tên của bạn"
                  className="w-full px-4 py-3 pl-11 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all"
                  required={isSignUp}
                  disabled={isLoading}
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          )}

          <div className="mb-5">
            <label className="font-medium mb-2 block text-gray-700 dark:text-gray-300">Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="w-full px-4 py-3 pl-11 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all"
                required
                disabled={isLoading}
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <div className="mb-5">
            <label className="font-medium mb-2 block text-gray-700 dark:text-gray-300">Mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full px-4 py-3 pl-11 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all"
                required
                disabled={isLoading}
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          {!isSignUp && (
            <div className="mb-6 text-right">
              <button type="button" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium">
                Quên mật khẩu?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang xử lý..." : (isSignUp ? "Tạo tài khoản" : "Đăng nhập")}
          </button>

          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {isSignUp ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setSuccess("");
                }}
                className="font-semibold text-gray-900 dark:text-white hover:underline"
                disabled={isLoading}
              >
                {isSignUp ? "Đăng nhập" : "Đăng ký"}
              </button>
            </p>
          </div>
        </form>

        {/* Social Login */}
        <div className="mt-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-50 dark:bg-gray-900 px-4 text-sm text-gray-500 dark:text-gray-400">Hoặc tiếp tục với</span>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Tiếp tục với Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}