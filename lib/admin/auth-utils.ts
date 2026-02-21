/**
 * Admin Authentication Utilities
 * Centralized verification logic - DRY principle
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { auth } from '@/auth';
import { Role } from '@prisma/client';
import { getAdminSecret } from '@/lib/env-validation';

// Define types for JWT payload
export interface AdminSession {
    id: string;
    email: string;
    role: string;
    permissions?: Record<string, string[]>;
    source: 'nextauth' | 'admin_cookie';
}

export interface AdminVerifyResult {
    success: boolean;
    admin?: AdminSession;
    error?: string;
    status?: number;
}

/**
 * Verify admin authentication from request
 * Checks both NextAuth session and admin_session cookie
 */
export async function verifyAdminAuth(request: NextRequest): Promise<AdminVerifyResult> {
    // 1. Verify NextAuth session
    try {
        const session = await auth();

        // Check if session exists and has a valid admin role
        if (session?.user?.id) {
            const userRole = session.user.role as string;
            const allowedRoles = ['ADMIN', 'SUPER_ADMIN'];

            if (allowedRoles.includes(userRole)) {
                return {
                    success: true,
                    admin: {
                        id: session.user.id,
                        email: session.user.email || '',
                        role: userRole,
                        source: 'nextauth',
                    },
                };
            }
        }
    } catch (e) {
        console.error('NextAuth check failed:', e);
    }

    // 2. Fallback is REMOVED as we strictly enforce NextAuth AdminUser session now
    // If we wanted to support legacy cookie during migration, we could keep it, 
    // but the plan is a clean switch.

    return { success: false, error: 'Unauthorized', status: 401 };
}
