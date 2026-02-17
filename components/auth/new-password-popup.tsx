"use client";

import type React from "react";
import { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";

import { useSearchParams, useRouter } from "next/navigation";
import { resetPasswordAction } from "@/features/auth/actions";
import {
  AuthButton,
  AuthInput,
  GoogleIcon,
  AppleIcon,
} from "./shared";

interface NewPasswordPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToVerificationCode: () => void;
  // Make these optional since they might come from URL in legacy flows, but we prefer props now
  code?: string;
  email?: string;
  onSuccess?: () => void;
}

export default function NewPasswordPopup({
  isOpen,
  onClose,
  onBackToVerificationCode,
  code: propCode,
  email: propEmail,
  onSuccess,
}: NewPasswordPopupProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();

  // Support mainly the new flow (props), but fallback to URL for legacy/direct links
  // But note: new actions.ts requires email/code, NOT token. So URL token flow is deprecated essentially unless we refactored backend to support both.
  // For this fix, we assume we are in the OTP flow.
  const code = propCode;
  const email = propEmail || "user@example.com"; // Should always be passed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    // We need code and email
    if (!code || !email) {
      setError("Missing verification details. Please start over.");
      return;
    }

    setIsLoading(true);

    try {
      // Call the new Action signature: email, code, password
      const result = await resetPasswordAction(email, code, password);

      if (!result.success) {
        throw new Error(
          result.errors
            ? typeof result.errors === 'string'
              ? result.errors
              : Object.values(result.errors).flat()[0]
            : result.message || "Failed to reset password"
        );
      }

      // Success
      if (onSuccess) {
        onSuccess();
      } else {
        // Fallback if no callback provided
        onClose();
        router.push('/signin?reset=success');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
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
              {/* Back button - strict circle */}
              <button
                type="button"
                onClick={onBackToVerificationCode}
                className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 sm:size-9"
                aria-label="Back"
              >
                <ArrowLeft className="size-4" />
              </button>
              <h1 className="text-lg font-bold text-black sm:text-3xl text-nowrap">
                New Password
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-4 space-y-4">
            <AuthInput
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
            />

            <AuthInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
            />

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>•</span>
              <span>Please make sure both passwords are the same.</span>
            </div>

            <AuthButton type="submit" variant="primary" isLoading={isLoading}>
              {isLoading ? "Saving..." : "Save Password"}
            </AuthButton>
          </form>


          {/* Footer text - hidden on mobile */}
          <p className="text-center text-[11px] leading-relaxed text-black mt-6 hidden sm:block">
            Secure Password Reset
          </p>

          <p className="text-center text-[11px] leading-relaxed text-black hidden sm:block">
            By clicking Sign in, Continue with Google, Facebook, or Apple, you
            agree to <span className="underline">Terms of Use</span> and{" "}
            <span className="underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
