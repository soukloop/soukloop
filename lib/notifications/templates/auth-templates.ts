import { createNotification } from '../create-notification';
import { SignupVerificationEmail } from '@/lib/email-templates/auth/signup-verification';
import { EmailVerifiedEmail } from '@/lib/email-templates/auth/email-verified';
import { PasswordResetEmail } from '@/lib/email-templates/auth/password-reset';
import { PasswordChangedEmail } from '@/lib/email-templates/auth/password-changed';
import { AccountSuspendedEmail } from '@/lib/email-templates/auth/account-suspended';
import { AccountReactivatedEmail } from '@/lib/email-templates/auth/account-reactivated';

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * Send sign-up verification email
 */
export async function notifySignupVerification(
  email: string,
  userId: string,
  verificationCode: string,
  token?: string
) {
  const verificationUrl = token
    ? `${baseUrl}/verify?token=${token}`
    : `${baseUrl}/verify?code=${verificationCode}`;

  return createNotification({
    userId,
    type: 'ACCOUNT_CREATED',
    title: 'Verify Your Email',
    message: `Welcome to SoukLoop! Your verification code is: ${verificationCode}`,
    actionUrl: '/verify',
    sendEmail: true,
    emailSubject: 'Verify your email address - SoukLoop',
    emailReact: SignupVerificationEmail({
      verificationCode,
      verificationUrl
    })
  });
}

/**
 * Send email verification confirmation
 */
export async function notifyEmailVerified(
  userId: string,
  userName?: string
) {
  return createNotification({
    userId,
    type: 'ACCOUNT_VERIFIED',
    title: 'Email Verified Successfully! 🎉',
    message: 'Your email has been verified. You can now access all features of SoukLoop.',
    actionUrl: '/',
    sendEmail: true,
    emailSubject: 'Email Verified Successfully - SoukLoop',
    emailReact: EmailVerifiedEmail({
      userName,
      dashboardUrl: `${baseUrl}/`
    })
  });
}

/**
 * Send password reset email
 */
export async function notifyPasswordReset(
  userId: string,
  email: string,
  resetCode: string,
  userName?: string
) {
  // We no longer send a link, but the code
  const { PasswordResetEmail } = await import('@/lib/email-templates/auth/password-reset'); // Lazy import to ensure we get updated one if needed

  return createNotification({
    userId,
    type: 'PASSWORD_RESET',
    title: 'Password Reset Code',
    message: `Your password reset code is: ${resetCode}`,
    actionUrl: `/reset-password`, // Just point to reset page, code is manual
    sendEmail: true,
    emailSubject: 'Reset Your Password - SoukLoop',
    emailReact: PasswordResetEmail({
      resetCode, // changed from resetUrl
      userName
    })
  });
}

/**
 * Send password changed security alert
 */
export async function notifyPasswordChanged(
  userId: string,
  userName?: string
) {
  const changeTime = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return createNotification({
    userId,
    type: 'PASSWORD_CHANGED',
    title: 'Password Changed',
    message: 'Your password was successfully changed.',
    actionUrl: '/edit-profile',
    sendEmail: true,
    emailSubject: 'Password Changed - SoukLoop Security Alert',
    emailReact: PasswordChangedEmail({
      userName,
      changeTime,
      supportUrl: `${baseUrl}/support`
    })
  });
}

/**
 * Send login notification
 */
export async function notifyLogin(
  userId: string,
  userName?: string
) {
  const time = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const { LoginAlertEmail } = await import('@/lib/email-templates/auth/login-alert');

  return createNotification({
    userId,
    type: 'ACCOUNT_UPDATED',
    title: 'New Login Detected 🔓',
    message: `New login to your account on ${time}.`,
    actionUrl: '/editprofile?section=security',
    sendEmail: true,
    emailSubject: 'New Login Detected - SoukLoop Security',
    emailReact: LoginAlertEmail({
      userName,
      loginTime: time,
      // We could add device info if we captured it in auth.ts, but for now generic is fine or we update auth.ts later
    })
  });
}

/**
 * Send logout notification
 */
export async function notifyLogout(
  userId: string
) {
  const time = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const { LogoutAlertEmail } = await import('@/lib/email-templates/auth/logout-alert');

  return createNotification({
    userId,
    type: 'ACCOUNT_UPDATED',
    title: 'Signed Out',
    message: 'You have been successfully signed out.',
    actionUrl: '/auth/signin',
    sendEmail: true,
    emailSubject: 'You have been signed out - SoukLoop',
    emailReact: LogoutAlertEmail({
      logoutTime: time
    })
  });
}



/**
 * Send account suspended email
 */
export async function notifyAccountSuspended(
  userId: string,
  userName?: string,
  reason?: string
) {
  return createNotification({
    userId,
    type: 'ACCOUNT_SUSPENDED',
    title: 'Account Suspended ⚠️',
    message: 'Your account has been suspended by an administrator.',
    actionUrl: '/contact-us',
    sendEmail: true,
    emailSubject: 'Important: Your Account Has Been Suspended',
    emailReact: AccountSuspendedEmail({
      userName,
      supportUrl: `${baseUrl}/contactus`,
      reason
    })
  });
}

/**
 * Send account reactivated email
 */
export async function notifyAccountReactivated(
  userId: string,
  userName?: string
) {
  return createNotification({
    userId,
    type: 'ACCOUNT_ACTIVATED',
    title: 'Account Reactivated 🎉',
    message: 'Your account has been reactivated. Welcome back!',
    actionUrl: '/auth/signin',
    sendEmail: true,
    emailSubject: 'Your Account Has Been Reactivated',
    emailReact: AccountReactivatedEmail({
      userName,
      loginUrl: `${baseUrl}/auth/signin`
    })
  });

}

/**
 * Send account deleted email
 */
export async function notifyAccountDeleted(
  email: string,
  userName?: string
) {
  // Note: User is deleted, so we can't create an in-app notification linked to them.
  // We strictly send an email here.
  const { sendEmail } = await import('@/lib/mail');

  // We can't use createNotification because it requires a valid userId for DB.
  await sendEmail({
    to: email,
    subject: 'Your Account Has Been Deleted - SoukLoop',
    html: `
            <h1>Account Deleted</h1>
            <p>Hi ${userName || 'there'},</p>
            <p>Your SoukLoop account has been permanently deleted as requested or by administrative action.</p>
            <p>We're sorry to see you go.</p>
        `
  });
}

/**
 * Send seller welcome email
 */
export async function notifySellerWelcome(
  userId: string,
  userName?: string
) {
  return createNotification({
    userId,
    type: 'SELLER_WELCOME',
    title: 'Welcome to SoukLoop Seller! 🚀',
    message: 'Congratulations! You are now a seller. Start listing your products today.',
    actionUrl: '/dashboard/seller',
    sendEmail: true,
    emailSubject: 'Welcome to SoukLoop Seller Program!',
    // We can add a SellerWelcomeEmail template later, using default for now
  });
}


/**
 * Send waitlist confirmation email
 */
export async function notifyWaitlistAdded(
  email: string
) {
  const { WaitlistConfirmationEmail } = await import('@/lib/email-templates/auth/waitlist-confirmation');
  const { sendEmail } = await import('@/lib/mail');

  await sendEmail({
    to: email,
    subject: "You're on the Waitlist! - SoukLoop",
    from: 'noreply',
    react: WaitlistConfirmationEmail()
  });
}
