// src/app/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Lock, Mail } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login/signup
    navigate("/");
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12 px-6 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              !isSignUp
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              isSignUp
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>

          {isSignUp && (
            <div className="mb-5">
              <label className="font-medium mb-2 block text-gray-700">Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  required={isSignUp}
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          )}

          <div className="mb-5">
            <label className="font-medium mb-2 block text-gray-700">Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                required
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="mb-5">
            <label className="font-medium mb-2 block text-gray-700">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                required
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {!isSignUp && (
            <div className="mb-6 text-right">
              <button type="button" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-6"
          >
            {isSignUp ? "Create Account" : "Login"}
          </button>

          <div className="text-center">
            <p className="text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-semibold text-gray-900 hover:underline"
              >
                {isSignUp ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>
        </form>

        {/* Social Login */}
        <div className="mt-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-50 px-4 text-sm text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full bg-white border border-gray-200 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Continue with Google
            </button>
            <button className="w-full bg-white border border-gray-200 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Continue with GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}