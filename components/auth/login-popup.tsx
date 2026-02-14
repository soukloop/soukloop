"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signIn } from "next-auth/react";
import {
  AuthButton,
  AuthInput,
  GoogleIcon,
  AppleIcon,
} from "./shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToAuth?: () => void;
  onOpenSignup: () => void;
  onOpenResetPassword: () => void;
}

export default function LoginPopup({
  isOpen,
  onClose,
  onOpenSignup,
  onOpenResetPassword,
}: LoginPopupProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl p-0 overflow-hidden bg-white border-none shadow-2xl sm:rounded-[20px] md:h-[700px] h-auto max-h-[90vh] flex flex-col md:flex-row gap-0">

        {/* Hidden DialogHeader for Accessibility but visually hidden or integrated */}
        <DialogHeader className="sr-only">
          <DialogTitle>Sign In</DialogTitle>
        </DialogHeader>

        {/* Left side image - hidden on mobile */}
        <div
          className="hidden bg-[#e0622c] md:flex shrink-0"
          style={{ width: "500px", minHeight: "100%" }}
        >
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Side%20Sectio-rzgPdjeL2YIIpicnwmMidM8n3cwhD5.png"
            alt="Two women in cardigans"
            className="size-full object-cover"
          />
        </div>

        {/* Right side form */}
        <div className="flex flex-1 flex-col px-6 py-4 sm:px-8 overflow-y-auto">
          {/* Header Row - Title, Sign Up button, Close button aligned horizontally */}
          <div className="mb-2 flex items-center justify-between sm:mb-4">
            <h1 className="text-xl font-bold text-black sm:text-3xl text-nowrap">
              Sign In
            </h1>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sign Up button - Pill design on both mobile and desktop */}
              <button
                type="button"
                onClick={onOpenSignup}
                className="flex h-8 items-center justify-center rounded-full bg-[#faf9f7] px-3 text-[11px] sm:text-xs font-medium text-[#e0622c] transition-colors hover:bg-[#f5f5f0] sm:h-9 sm:px-5 whitespace-nowrap"
              >
                Sign Up
              </button>
              {/* Close button - strict circle - calling onClose directly */}
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-full bg-black transition-colors hover:bg-gray-800 sm:size-10"
              >
                <X className="size-4 text-white sm:size-5" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form - Enter key will trigger handleSubmit */}
          <form onSubmit={handleSubmit} className="mb-4 space-y-4">
            <AuthInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email"
              autoComplete="username"
              required
            />

            <AuthInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
            />

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`flex size-5 items-center justify-center rounded border-2 ${rememberMe
                        ? "border-[#e0622c] bg-[#e0622c]"
                        : "border-gray-300 bg-white"
                      }`}
                  >
                    {rememberMe && (
                      <svg
                        className="size-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-sm text-black">Remember me</span>
              </label>
              {/* CRITICAL: type="button" prevents this from submitting the form on Enter */}
              <button
                type="button"
                onClick={onOpenResetPassword}
                className="text-sm text-black hover:underline"
              >
                Forgot your password?
              </button>
            </div>

            {/* Sign In button - type="submit" so Enter key triggers this */}
            <AuthButton type="submit" variant="primary" isLoading={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </AuthButton>
          </form>

          {/* OR divider */}
          <div className="mb-4 flex items-center sm:mb-6">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="px-4 text-sm font-medium text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          {/* Social login buttons */}
          <div className="mb-4 flex flex-col items-center space-y-2">
            <AuthButton
              variant="social"
              icon={<GoogleIcon />}
              onClick={() => signIn("google")}
            >
              Continue with Google
            </AuthButton>

            <AuthButton
              variant="social"
              icon={<AppleIcon />}
              onClick={() => signIn("apple")}
            >
              Continue with Apple
            </AuthButton>
          </div>

          {/* Footer text - hidden on mobile */}
          <p className="text-center text-[11px] leading-relaxed text-black hidden sm:block">
            By clicking Sign in, Continue with Google or Apple, you
            agree to <span className="underline">Terms of Use</span> and{" "}
            <span className="underline">Privacy Policy</span>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
