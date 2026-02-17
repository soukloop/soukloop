"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { X, AlertCircle, ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";

import { useRouter } from "next/navigation";
import { verifyEmailAction, verifyResetCodeAction } from "@/features/auth/actions";
import {
  AuthButton,
  GoogleIcon,
  AppleIcon,
} from "./shared";

interface VerificationCodePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToResetPassword: () => void;
  onOpenNewPassword: (code: string) => void; // Pass code to next step
  email?: string;
  mode?: "signup" | "reset"; // Added mode
}

export default function VerificationCodePopup({
  isOpen,
  onClose,
  onBackToResetPassword,
  onOpenNewPassword,
  email = "info****@gmail.com",
  mode = "signup", // Default to signup for backward compatibility
}: VerificationCodePopupProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(59);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(59);
      setCode(["", "", "", "", "", ""]);
    }
  }, [isOpen]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleResendCode = () => {
    setTimeLeft(59);
    setCode(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    // Implementation note: You might want to trigger resend action here based on mode
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const codeString = code.join("");

    if (codeString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (mode === 'reset') {
        // Use the new Verify OTP action for Reset
        result = await verifyResetCodeAction(email, codeString);
      } else {
        // Use existing Email Verification action
        result = await verifyEmailAction(email, codeString);
      }

      if (!result.success) {
        throw new Error(
          result.errors
            ? typeof result.errors === 'string'
              ? result.errors
              : Object.values(result.errors).flat()[0]
            : result.message || "Verification failed"
        );
      }

      // Success
      if (mode === 'reset') {
        // Pass the valid code to the next step (NewPasswordPopup)
        onOpenNewPassword(codeString);
      } else {
        // Signup Success
        if (email !== "info****@gmail.com") {
          onClose();
          router.push("/signin?verified=true");
        } else {
          // Fallback for legacy demo flow
          onOpenNewPassword(codeString);
        }
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
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
                onClick={onBackToResetPassword}
                className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 sm:size-9"
                aria-label="Back"
              >
                <ArrowLeft className="size-4" />
              </button>
              <h1 className="text-lg font-bold text-black sm:text-3xl text-nowrap">
                {mode === 'reset' ? 'Verify Reset Code' : 'Enter Code'}
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
              <AlertCircle className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Verification code inputs */}
          <div className="mb-6">
            <div className="mb-4 flex justify-center gap-2 sm:gap-4">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="size-10 rounded-lg border border-gray-200 bg-gray-50 text-center text-sm outline-none transition-all focus:border-[#e0622c] focus:ring-2 focus:ring-[#e0622c] focus:ring-opacity-50 sm:size-12 sm:text-base"
                  maxLength={1}
                />
              ))}
            </div>

            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-500">
                  Resend code in {formatTime(timeLeft)}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-sm font-medium text-[#e0622c] hover:underline"
                >
                  Resend code
                </button>
              )}
            </div>
          </div>

          <AuthButton
            type="button"
            variant="primary"
            isLoading={isLoading}
            onClick={handleSubmit}
            className="mb-4"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </AuthButton>
        </div>
      </div>
    </div>
  );
}
