"use client";

import { useState } from "react";

import { X, ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";
import { forgotPasswordAction } from "@/features/auth/actions";
import {
  AuthButton,
  AuthInput,
  GoogleIcon,
  AppleIcon,
} from "./shared";

interface ResetPasswordPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
  onOpenVerificationCode: (email: string) => void;
}

export default function ResetPasswordPopup({
  isOpen,
  onClose,
  onBackToLogin,
  onOpenVerificationCode,
}: ResetPasswordPopupProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsLoading(true);
      setError("");

      try {

        const result = await forgotPasswordAction(email.trim());

        if (!result.success) {
          throw new Error(
            result.errors
              ? typeof result.errors === 'string'
                ? result.errors
                : Object.values(result.errors).flat()[0]
              : result.message || "Failed to send reset link"
          );
        }

        // Show success state or verification code logic
        // Current flow asks to open verification code, which we are essentially reusing 
        // to tell them "Email sent"
        // For link-based flow, we just want to tell them "Check your email"
        onOpenVerificationCode(email);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex h-auto max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[20px] bg-white md:h-[700px] md:flex-row md:overflow-hidden">
        {/* Left side image */}
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
          {/* Header Row */}
          <div className="mb-2 flex items-center justify-between sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Back Button - strict circle */}
              <button
                type="button"
                onClick={onBackToLogin}
                className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 sm:size-9"
                aria-label="Back to login"
              >
                <ArrowLeft className="size-4" />
              </button>
              <h1 className="text-lg font-bold text-black sm:text-3xl text-nowrap">
                Reset Password
              </h1>
            </div>
            {/* Close button - strict circle */}
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-black transition-colors hover:bg-gray-800 sm:size-10"
            >
              <X className="size-4 text-white sm:size-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-4 space-y-4">
            <AuthInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email"
              required
            />

            {/* Error Message */}
            {error && (
              <div className="mb-4 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <AuthButton type="submit" variant="primary" isLoading={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </AuthButton>
          </form>
        </div>
      </div>
    </div>
  );
}
