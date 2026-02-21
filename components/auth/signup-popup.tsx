"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import {
  AuthButton,
  AuthInput,
  GoogleIcon,
  AppleIcon,
} from "./shared";

interface SignupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onOpenVerificationCode: (email: string, password?: string) => void;
  onBackToAuth?: () => void;
}

export default function SignupPopup({
  isOpen,
  onClose,
  onOpenLogin,
  onOpenVerificationCode,
  onBackToAuth,
}: SignupPopupProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await register({
        email,
        username: firstName,
        password,
        fullName: firstName,
      });
      onOpenVerificationCode(email, password);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex h-auto max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[20px] bg-white md:h-[700px] md:flex-row md:overflow-hidden">
        {/* Left side image - hidden on mobile, fixed 500px width */}
        <div
          className="hidden bg-[#e0622c] md:flex"
          style={{ width: "500px", minHeight: "100%" }}
        >
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Side%20Sectio-rzgPdjeL2YIIpicnwmMidM8n3cwhD5.png"
            alt="Two women in cardigans"
            className="size-full object-cover"
          />
        </div>

        {/* Right side form */}
        <div className="flex flex-1 flex-col px-6 py-4 sm:px-8">
          {/* Header Row - Title, Sign In button, Close button aligned horizontally */}
          <div className="mb-2 flex items-center justify-between sm:mb-4">
            <h1 className="text-xl font-bold text-black sm:text-3xl text-nowrap">
              Create Account
            </h1>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sign In button - Pill design on both mobile and desktop */}
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex h-8 items-center justify-center rounded-full bg-[#faf9f7] px-3 text-[11px] sm:text-xs font-medium text-[#e0622c] transition-colors hover:bg-[#f5f5f0] sm:h-9 sm:px-5 whitespace-nowrap"
              >
                Sign In
              </button>
              {/* Close button - strict circle */}
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
          <form onSubmit={handleSubmit} className="mb-4 space-y-3">
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
              label="First Name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter Your Name"
              required
            />

            <AuthInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              required
            />

            {/* Register button - type="submit" so Enter key triggers this */}
            <AuthButton type="submit" variant="primary" isLoading={isLoading}>
              {isLoading ? "Registering..." : "Register Now"}
            </AuthButton>
          </form>

          {/* OR divider */}
          <div className="mb-4 flex items-center sm:mb-6">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="px-4 text-sm font-medium text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          {/* Social login buttons */}
          <div className="flex flex-col items-center space-y-2 mb-4">
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

          {/* Terms text - Moved to bottom, hidden on mobile */}
          <p className="text-center text-[11px] leading-relaxed text-black hidden sm:block">
            By clicking Register or Continue with Google or Apple,
            you agree to <span className="underline">Terms of Use</span> and{" "}
            <span className="underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
