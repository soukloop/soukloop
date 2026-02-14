"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { Role } from "@prisma/client";
import { generateVerificationToken } from "@/lib/tokens";
import {
    notifySignupVerification,
    notifyPasswordReset,
    notifyPasswordChanged,
    notifyEmailVerified,
    notifyWaitlistAdded,
} from "@/lib/notifications/templates/auth-templates";
import { RewardService } from "@/features/rewards/service";
import {
    ACTION_TYPES,
    REWARD_RULES,
    REFERENCE_TYPES,
} from "@/features/rewards/constants";
import {
    RegisterSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    type RegisterInput,
} from "@/lib/validations";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
    registerRateLimit,
    passwordResetRateLimit,
    emailVerificationRateLimit,
    checkRateLimit,
} from "@/lib/rate-limit";
import { auth } from "@/auth"; // Added for checkSuspensionStatus

/*
 * Professional Server Actions for Authentication
 * Follows 'src/features/<feature>/actions.ts' pattern.
 */

export async function checkSuspensionStatus() {
    try {
        const session = await auth()
        if (!session?.user?.id) return null

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isActive: true }
        })

        return user?.isActive ?? true // Default to true if user not found (safe fail)
    } catch (error) {
        console.error('Failed to check suspension status:', error)
        return true // Assume active on error to avoid lockout
    }
}

export type ActionState = {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]> | string;
};

/**
 * Register a new user
 */
export async function registerUserAction(data: RegisterInput): Promise<ActionState> {
    try {
        const ip = headers().get("x-forwarded-for") || "127.0.0.1";
        const { success: limitSuccess, retryAfter } = await checkRateLimit(ip, registerRateLimit);
        if (!limitSuccess) {
            return {
                success: false,
                message: `Too many attempts. Please try again in ${retryAfter}s.`,
            };
        }

        const validation = RegisterSchema.safeParse(data);

        if (!validation.success) {
            return {
                success: false,
                errors: validation.error.flatten().fieldErrors,
                message: "Validation failed",
            };
        }

        const { email, username, password } = validation.data;
        const normalizedEmail = email.toLowerCase();

        // 1. Check if Registration is Allowed
        const allowRegistrationSetting = await prisma.settings.findUnique({
            where: { key: 'allowRegistration' }
        });

        if (allowRegistrationSetting?.value === 'false') {
            console.log(`[Auth] Registration blocked for ${normalizedEmail}. Adding to waitlist.`);
            
            // Add to waitlist
            await prisma.waitlistEntry.upsert({
                where: { email: normalizedEmail },
                update: {}, // Don't change anything if they try again
                create: { email: normalizedEmail }
            });

            // Send waitlist confirmation
            await notifyWaitlistAdded(normalizedEmail);

            return {
                success: true, 
                message: "Registration is currently closed. We've added you to our waitlist and will notify you as soon as we open!",
            };
        }


        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            return {
                success: false,
                message: "User with this email already exists",
            };
        }

        const hashedPassword = await hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                username: username,
                name: username,
                password: hashedPassword,
                role: Role.USER,
                profile: {
                    create: {
                        firstName: username,
                    },
                },
            },
            include: {
                profile: true,
            },
        });

        // Award registration points
        try {
            await prisma.$transaction(async (tx) => {
                await RewardService.awardPoints(tx, {
                    userId: user.id,
                    points: REWARD_RULES.POINTS_FOR_REGISTRATION,
                    actionType: ACTION_TYPES.REGISTRATION,
                    referenceId: user.id, // Using user ID as reference
                    referenceType: REFERENCE_TYPES.SYSTEM,
                    note: "Welcome reward for joining Soukloop!",
                });
            });
        } catch (rewardError) {
            console.error("Failed to award registration points:", rewardError);
            // Continue execution even if rewards fail
        }

        // Generate verification token
        const verificationToken = await generateVerificationToken(normalizedEmail);

        // Send verification email
        await notifySignupVerification(
            verificationToken.identifier,
            user.id,
            verificationToken.token
        );

        return {
            success: true,
            message: "User registered successfully",
        };
    } catch (error) {
        console.error("Registration error:", error);
        return {
            success: false,
            message: "An internal error occurred during registration.",
        };
    }
}

/**
 * Forgot Password - Send Reset Link
 */
export async function forgotPasswordAction(email: string): Promise<ActionState> {
    try {
        const ip = headers().get("x-forwarded-for") || "127.0.0.1";
        const { success: limitSuccess, retryAfter } = await checkRateLimit(ip, passwordResetRateLimit);
        if (!limitSuccess) {
            return {
                success: false,
                message: `Too many attempts. Please try again in ${retryAfter}s.`,
            };
        }

        const validation = ForgotPasswordSchema.safeParse({ email });

        if (!validation.success) {
            return {
                success: false,
                errors: validation.error.flatten().fieldErrors,
            };
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        // Prevent enumeration timing attacks (always return success)
        if (!user) {
            // Simulate delay if needed, or just return success
            return { success: true, message: "If an account exists, a reset link has been sent." };
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Delete existing reset tokens
        await prisma.verificationToken.deleteMany({
            where: {
                identifier: normalizedEmail,
                token: { startsWith: "reset_" },
            },
        });

        await prisma.verificationToken.create({
            data: {
                identifier: normalizedEmail,
                token: `reset_${hashedToken}`,
                expires,
            },
        });

        // Send email
        await notifyPasswordReset(
            user.id,
            normalizedEmail,
            resetToken, // send raw token
            user.name || undefined
        );

        return { success: true, message: "If an account exists, a reset link has been sent." };
    } catch (error) {
        console.error("Forgot password error:", error);
        return { success: false, message: "Failed to process request." };
    }
}

/**
 * Reset Password
 */
export async function resetPasswordAction(
    token: string,
    password: string
): Promise<ActionState> {
    try {
        const validation = ResetPasswordSchema.safeParse({ token, password });

        if (!validation.success) {
            return {
                success: false,
                errors: validation.error.flatten().fieldErrors,
            };
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const storedToken = await prisma.verificationToken.findFirst({
            where: {
                token: `reset_${hashedToken}`,
            },
        });

        if (!storedToken) {
            return { success: false, message: "Invalid or expired reset token." };
        }

        if (new Date() > storedToken.expires) {
            await prisma.verificationToken.delete({
                where: {
                    identifier_token: {
                        identifier: storedToken.identifier,
                        token: storedToken.token,
                    },
                },
            });
            return { success: false, message: "Reset token has expired." };
        }

        const hashedPassword = await hash(password, 12);

        const user = await prisma.user.update({
            where: { email: storedToken.identifier },
            data: { password: hashedPassword },
        });

        await notifyPasswordChanged(user.id, user.name || undefined);

        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: storedToken.identifier,
                    token: storedToken.token,
                },
            },
        });

        // Use identifier, not email in the where clause
        await prisma.verificationToken.deleteMany({
            where: {
                identifier: storedToken.identifier,
                token: { startsWith: "reset_" },
            },
        });

        return { success: true, message: "Password reset successful." };
    } catch (error) {
        console.error("Reset password error:", error);
        return { success: false, message: "An error occurred while resetting password." };
    }
}

/**
 * Verify Email
 */
export async function verifyEmailAction(
    email: string,
    code: string
): Promise<ActionState> {
    try {
        const ip = headers().get("x-forwarded-for") || "127.0.0.1";
        const { success: limitSuccess, retryAfter } = await checkRateLimit(ip, emailVerificationRateLimit);
        if (!limitSuccess) {
            return {
                success: false,
                message: `Too many attempts. Please try again in ${retryAfter}s.`,
            };
        }

        if (!email || !code) {
            return { success: false, message: "Email and code are required." };
        }

        const normalizedEmail = email.toLowerCase();

        const existingToken = await prisma.verificationToken.findFirst({
            where: {
                identifier: normalizedEmail,
                token: code,
            },
        });

        if (!existingToken) {
            return { success: false, message: "Invalid verification code." };
        }

        if (new Date() > existingToken.expires) {
            return { success: false, message: "Verification code has expired." };
        }

        const user = await prisma.user.update({
            where: { email: normalizedEmail },
            data: {
                emailVerified: new Date(),
            },
        });

        await notifyEmailVerified(user.id, user.name || undefined);

        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: existingToken.identifier,
                    token: existingToken.token,
                },
            },
        });

        return { success: true, message: "Email verified successfully." };
    } catch (error) {
        console.error("Verification error:", error);
        return { success: false, message: "Failed to verify email." };
    }
}
