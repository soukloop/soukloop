"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import LoginPopup from "./login-popup";
import SignupPopup from "./signup-popup";
import ResetPasswordPopup from "./reset-password-popup";
import VerificationCodePopup from "./verification-code-popup";
import NewPasswordPopup from "./new-password-popup";
import { signIn } from "next-auth/react";

// ✅ Only keep unique prop interfaces
export interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToAuth: () => void;
  onOpenSignup: () => void;
  onOpenResetPassword: () => void;
}
interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ResetPasswordPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
  onOpenVerificationCode: (email: string) => void;
}

export interface VerificationCodePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToResetPassword: () => void;
  onOpenNewPassword: () => void;
  email: string;
}

export interface NewPasswordPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToVerificationCode: () => void; // ✅ Add this line
}

export default function AuthPopup({ onClose }: AuthPopupProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isVerificationCodeOpen, setIsVerificationCodeOpen] = useState(false);
  const [isNewPasswordOpen, setIsNewPasswordOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  // Track the verified code to pass to NewPasswordPopup
  const [verifiedCode, setVerifiedCode] = useState<string | undefined>(undefined);
  // Track the mode for verification popup
  const [verificationMode, setVerificationMode] = useState<"signup" | "reset">("signup");

  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

  const handleSignupClick = () => {
    setIsAuthOpen(false);
    setIsSignupOpen(true);
  };

  const handleLoginClick = () => {
    setIsAuthOpen(false);
    setIsLoginOpen(true);
  };

  const handleBackToAuth = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(false);
    setIsResetPasswordOpen(false);
    setIsVerificationCodeOpen(false);
    setIsNewPasswordOpen(false);
    setIsAuthOpen(true);
  };
  const handleLoginToSignup = () => {
    setIsSignupOpen(true);
    setIsLoginOpen(false);
  };

  const handleSignupToLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const handleOpenResetPassword = () => {
    setIsLoginOpen(false);
    setIsResetPasswordOpen(true);
  };

  const handleResetPasswordToLogin = () => {
    setIsResetPasswordOpen(false);
    setIsLoginOpen(true);
  };

  const handleOpenVerificationCode = (email: string) => {
    setVerificationEmail(email);
    // If we are coming from Reset Password popup (Lines 52-56 of reset-password-popup), assume reset mode
    // logic: reset-password-popup calls this. 
    // We can default to 'reset' here if we are currently in ResetPasswordOpen state
    if (isResetPasswordOpen) {
      setVerificationMode("reset");
    } else {
      setVerificationMode("signup");
    }

    setIsResetPasswordOpen(false);
    setIsVerificationCodeOpen(true);
  };

  const handleVerificationCodeToResetPassword = () => {
    setIsVerificationCodeOpen(false);
    setIsResetPasswordOpen(true);
  };

  const handleOpenNewPassword = (code?: string) => {
    // If pased a code (from verification popup), store it
    if (code) {
      setVerifiedCode(code);
    }
    setIsVerificationCodeOpen(false);
    setIsNewPasswordOpen(true);
  };

  const handleNewPasswordToVerificationCode = () => {
    setIsNewPasswordOpen(false);
    setIsVerificationCodeOpen(true);
  };

  const handleNewPasswordSuccess = () => {
    setIsNewPasswordOpen(false);
    setIsLoginOpen(true);
    // verificationEmail is already set, we will pass it to LoginPopup
  };

  const handleCloseAll = () => {
    setIsAuthOpen(false);
    setIsLoginOpen(false);
    setIsSignupOpen(false);
    setIsResetPasswordOpen(false);
    setIsVerificationCodeOpen(false);
    setIsNewPasswordOpen(false);
    onClose();
  };

  if (
    !isAuthOpen &&
    !isLoginOpen &&
    !isSignupOpen &&
    !isResetPasswordOpen &&
    !isVerificationCodeOpen &&
    !isNewPasswordOpen
  )
    return null;

  return (
    <>
      {/* Main Auth Popup */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="relative h-auto w-full max-w-md rounded-2xl bg-[#f9f9f9] p-6 sm:max-w-xl sm:p-8 lg:max-w-2xl">
            {/* Close button */}
            <button
              onClick={handleCloseAll}
              className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-black transition-colors hover:bg-gray-800 sm:right-6 sm:top-6 sm:size-12"
            >
              <X className="size-5 text-white sm:size-6" />
            </button>

            {/* Header */}
            <h1 className="mb-6 pr-12 text-2xl font-bold text-black sm:mb-8 sm:pr-16 sm:text-4xl">
              Sign up or Log in
            </h1>

            {/* Main action buttons */}
            <div className="mb-6 flex flex-col items-center space-y-4 sm:mb-8">
              <button
                onClick={handleSignupClick}
                className="flex h-[52px] w-full items-center justify-center rounded-full bg-[#e8d5c4] text-base font-semibold text-[#e0622c] transition-colors hover:bg-[#e0d0c0] sm:h-[56px] sm:w-[536px] sm:text-lg"
              >
                Sign up
              </button>
              <button
                onClick={handleLoginClick}
                className="flex h-[52px] w-full items-center justify-center rounded-full bg-[#e0622c] text-base font-semibold text-white transition-colors hover:bg-[#d55a28] sm:h-[56px] sm:w-[536px] sm:text-lg"
              >
                Log In
              </button>
            </div>

            {/* OR divider */}
            <div className="mb-6 flex items-center sm:mb-8">
              <div className="h-px flex-1 bg-gray-400"></div>
              <span className="px-3 text-sm font-medium text-gray-500 sm:px-4 sm:text-base">
                OR
              </span>
              <div className="h-px flex-1 bg-gray-400"></div>
            </div>

            {/* Social login buttons */}
            <div className="mb-1 flex flex-col items-center space-y-1 sm:mb-3 sm:space-y-1">
              <button
                className="flex h-[32px] w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 sm:h-[46px] sm:w-[536px]"
                onClick={() => {
                  setIsOAuthLoading("google");
                  signIn("google", { callbackUrl: "/" });
                }}
                disabled={isOAuthLoading !== null}
              >
                {isOAuthLoading === "google" ? (
                  <Loader2 className="size-5 animate-spin text-gray-600" />
                ) : (
                  <svg className="size-5" viewBox="0 0 24 24">
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
                )}
                <span className="text-[14px] font-medium text-black sm:text-[14px]">
                  {isOAuthLoading === "google" ? "Connecting..." : "Continue with Google"}
                </span>
              </button>



              <button
                className="flex h-[32px] w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 sm:h-[46px] sm:w-[536px]"
                onClick={() => {
                  setIsOAuthLoading("apple");
                  signIn("apple", { callbackUrl: "/" });
                }}
                disabled={isOAuthLoading !== null}
              >
                {isOAuthLoading === "apple" ? (
                  <Loader2 className="size-5 animate-spin text-gray-600" />
                ) : (
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path
                      fill="#000000"
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                    />
                  </svg>
                )}
                <span className="text-[14px] font-medium text-black sm:text-[14px]">
                  {isOAuthLoading === "apple" ? "Connecting..." : "Continue with Apple"}
                </span>
              </button>
            </div>
            {/* Footer text */}
            <p className="text-center text-xs leading-relaxed text-black sm:text-sm">
              By clicking Sign in, Continue with Google or Apple, you
              agree to Terms of Use and Privacy Policy.
            </p>
          </div>
        </div>
      )}

      {/* Login Popup */}
      {isLoginOpen && (
        <LoginPopup
          isOpen={isLoginOpen}
          onClose={handleCloseAll}
          onOpenSignup={handleLoginToSignup}
          onOpenResetPassword={handleOpenResetPassword}
          initialEmail={verificationEmail}
        />
      )}

      {/* Signup Popup */}
      {isSignupOpen && (
        <SignupPopup
          isOpen={isSignupOpen}
          onClose={handleCloseAll}
          onBackToAuth={handleBackToAuth}
          onOpenLogin={handleSignupToLogin}
          onOpenVerificationCode={handleOpenVerificationCode}
        />
      )}

      {/* Reset Password Popup */}
      {isResetPasswordOpen && (
        <ResetPasswordPopup
          isOpen={isResetPasswordOpen}
          onClose={handleCloseAll}
          onBackToLogin={handleResetPasswordToLogin}
          onOpenVerificationCode={handleOpenVerificationCode}
        />
      )}

      {/* Verification Code Popup */}
      {isVerificationCodeOpen && (
        <VerificationCodePopup
          isOpen={isVerificationCodeOpen}
          onClose={handleCloseAll}
          onBackToResetPassword={handleVerificationCodeToResetPassword}
          onOpenNewPassword={handleOpenNewPassword}
          email={verificationEmail}
          mode={verificationMode}
        />
      )}

      {/* New Password Popup */}
      {isNewPasswordOpen && (
        <NewPasswordPopup
          isOpen={isNewPasswordOpen}
          onClose={handleCloseAll}
          onBackToVerificationCode={handleNewPasswordToVerificationCode}
          code={verifiedCode}
          email={verificationEmail}
          onSuccess={handleNewPasswordSuccess}
        />
      )}
    </>
  );
}
