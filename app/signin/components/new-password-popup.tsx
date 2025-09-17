"use client";

import type React from "react";
import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

interface NewPasswordPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToVerificationCode: () => void;
}

export default function NewPasswordPopup({
  isOpen,
  onClose,
  onBackToVerificationCode,
}: NewPasswordPopupProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === confirmPassword && password.length > 0) {
      // Handle password reset
      console.log("[v0] Password reset successful");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-6">
      <div
        className="bg-white w-full h-[650px] rounded-2xl relative  max-w-6xl flex flex-col md:flex-row overflow-hidden"
        style={{ width: "1100px", height: "600px" }}
      >
        {" "}
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="flex h-full">
          {/* Left side image (hidden on mobile) */}
          <div
            className="hidden md:flex md:w-1/2 bg-[#e0622c]"
            style={{ width: "500px", height: "1080px" }}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Side%20Sectio-rzgPdjeL2YIIpicnwmMidM8n3cwhD5.png"
              alt="Two women in cardigans"
              className="w-[500px] h-[650px] object-cover "
            />
          </div>

          {/* Right side form */}
          <div className="my-[16rem] flex-1 flex flex-col justify-center px-2 sm:px-[0.5px] py-6 sm:py-12">
            {/* Header */}
            <div className="my-[16rem] flex-1 flex flex-col justify-center px-5 sm:px-12 py-6 sm:py-12">
              <div className="mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-black mb-0 sm:mb-1">
                  Reset your password
                </h1>
                <p className="text-gray-500 text-[12px] sm:text-[12px]">
                  Enter your new password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Enter Password */}
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e0622c] bg-gray-50 text-sm sm:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e0622c] bg-gray-50 text-sm sm:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Validation note */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>•</span>
                  <span>Please make sure both passwords are the same.</span>
                </div>

                {/* Sign In button */}
                <button
                  type="submit"
                  className="w-full bg-[#e0622c] text-white font-medium py-1 sm:py-2 rounded-full hover:bg-[#d55a28] transition-colors mb-2 sm:mb-4 text-sm sm:text-base"
                >
                  Sign In
                </button>
              </form>

              {/* OR divider */}
              <div className="flex items-center my-8">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-4 text-gray-400 font-medium text-sm">
                  OR
                </span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Social login buttons */}
              <div className="space-y-1 sm:space-y-1 mb-1 sm:mb-3 flex flex-col items-center">
                <button className="bg-white border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors w-full sm:w-[536px] h-[32px] sm:h-[36px] rounded-full">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 6.16-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-black font-medium text-[14px] sm:text-[14px]">
                    Continue with Google
                  </span>
                </button>

                <button className="bg-white border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors w-full sm:w-[536px] h-[32px] sm:h-[36px] rounded-full">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#1877f2"
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    />
                  </svg>
                  <span className="text-black font-medium text-[14px] sm:text-[14px]">
                    Continue with Facebook
                  </span>
                </button>

                <button className="bg-white border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors w-full sm:w-[536px] h-[32px] sm:h-[36px] rounded-full">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#000000"
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                    />
                  </svg>
                  <span className="text-black font-medium text-[14px] sm:text-[14px]">
                    Continue with Apple
                  </span>
                </button>
              </div>

              {/* Footer text */}
              <p className="text-center text-black text-[11px] sm:text-[11px] leading-relaxed mb-2">
                By clicking Sign in, Continue with Google, Facebook, or Apple,
                you agree to <span className="underline">Terms of Use</span> and{" "}
                <span className="underline">Privacy Policy</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
