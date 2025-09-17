"use client";

import { useState } from "react";
import { X } from "lucide-react";
import LoginPopup from "./login-popup";
import SignupPopup from "./signup-popup";
import ResetPasswordPopup from "./reset-password-popup";
import VerificationCodePopup from "./verification-code-popup";
import NewPasswordPopup from "./new-password-popup";

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
  onBackToVerificationCode: () => void;
}

export default function AuthPopup({ isOpen, onClose }: AuthPopupProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isVerificationCodeOpen, setIsVerificationCodeOpen] = useState(false);
  const [isNewPasswordOpen, setIsNewPasswordOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

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
    setIsLoginOpen(false);
    setIsSignupOpen(true);
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
    setIsResetPasswordOpen(false);
    setIsVerificationCodeOpen(true);
  };

  const handleVerificationCodeToResetPassword = () => {
    setIsVerificationCodeOpen(false);
    setIsResetPasswordOpen(true);
  };

  const handleOpenNewPassword = () => {
    setIsVerificationCodeOpen(false);
    setIsNewPasswordOpen(true);
  };

  const handleNewPasswordToVerificationCode = () => {
    setIsNewPasswordOpen(false);
    setIsVerificationCodeOpen(true);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#f9f9f9] rounded-2xl p-6 sm:p-8 relative w-full max-w-md sm:max-w-xl lg:max-w-2xl h-auto">
            {/* Close button */}
            <button
              onClick={handleCloseAll}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>

            {/* Header */}
            <h1 className="text-2xl sm:text-4xl font-bold text-black mb-6 sm:mb-8 pr-12 sm:pr-16">
              Sign up or Log in
            </h1>

            {/* Main action buttons */}
            <div className="space-y-4 mb-6 sm:mb-8 flex flex-col items-center">
              <button
                onClick={handleSignupClick}
                className="bg-[#e8d5c4] text-[#e0622c] font-semibold text-base sm:text-lg hover:bg-[#e0d0c0] transition-colors flex items-center justify-center w-full sm:w-[536px] h-[52px] sm:h-[56px] rounded-full"
              >
                Sign up
              </button>
              <button
                onClick={handleLoginClick}
                className="bg-[#e0622c] text-white font-semibold text-base sm:text-lg hover:bg-[#d55a28] transition-colors flex items-center justify-center w-full sm:w-[536px] h-[52px] sm:h-[56px] rounded-full"
              >
                Log In
              </button>
            </div>

            {/* OR divider */}
            <div className="flex items-center mb-6 sm:mb-8">
              <div className="flex-1 h-px bg-gray-400"></div>
              <span className="px-3 sm:px-4 text-gray-500 font-medium text-sm sm:text-base">
                OR
              </span>
              <div className="flex-1 h-px bg-gray-400"></div>
            </div>

            {/* Social login buttons */}
            <div className="space-y-1 sm:space-y-1 mb-1 sm:mb-3 flex flex-col items-center">
              <button className="bg-white border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors w-full sm:w-[536px] h-[32px] sm:h-[46px] rounded-full">
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

              <button className="bg-white border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors w-full sm:w-[536px] h-[32px] sm:h-[46px] rounded-full">
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

              <button className="bg-white border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors w-full sm:w-[536px] h-[32px] sm:h-[46px] rounded-full">
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
            <p className="text-center text-black text-xs sm:text-sm leading-relaxed">
              By clicking Sign in, Continue with Google, Facebook, or Apple, you
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
          onBackToAuth={handleBackToAuth}
          onOpenSignup={handleLoginToSignup}
          onOpenResetPassword={handleOpenResetPassword}
        />
      )}

      {/* Signup Popup */}
      {isSignupOpen && (
        <SignupPopup
          isOpen={isSignupOpen}
          onClose={handleCloseAll}
          onBackToAuth={handleBackToAuth}
          onOpenLogin={handleSignupToLogin}
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
        />
      )}

      {/* New Password Popup */}
      {isNewPasswordOpen && (
        <NewPasswordPopup
          isOpen={isNewPasswordOpen}
          onClose={handleCloseAll}
          onBackToVerificationCode={handleNewPasswordToVerificationCode}
        />
      )}
    </>
  );
}
