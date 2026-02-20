import { auth } from "@/auth";

import { NextResponse } from "next/server";
import { z } from "zod";

type ApiHandler = (req: Request, context: any) => Promise<NextResponse>;

/**
 * High-Order Function to wrap API Route Handlers with Security Checks.
 * 
 * It performs:
 * 1. Session Authentication
 * 2. Suspension Check (via validateRequest)
 * 3. Token Version Check (via validateRequest)
 * 
 * Usage:
 * export const POST = withAuth(async (req) => { ... });
 */
export function withAuth(handler: ApiHandler): ApiHandler {
    return async (req: Request, context: any) => {
        try {
            // Run the optimized security check
            // validateRequest throws a Redirect on failure, which Next.js handles.
            // However, in API routes, we want a JSON 401/403, not a 307 Redirect HTML.

            const session = await auth();

            // The session is now strictly validated in auth.ts (JWT Callback).
            // If session is present, the user exists and is active.
            if (!session || !session.user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            // Additional Check: If the session says inactive (edge case), block it.
            // @ts-ignore
            if (session.user.isActive === false) {
                return NextResponse.json({ error: "Account Suspended" }, { status: 403 });
            }

            // Proceed to handler
            return await handler(req, context);
        } catch (error) {
            console.error("[API Wrapper] Error:", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    };
}

export function handleApiError(error: any) {
    console.error("[API Error] Handled Exception:", error);

    if (error instanceof z.ZodError) {
        return NextResponse.json(
            { error: "Invalid input", details: error.flatten() },
            { status: 400 }
        );
    }

    if (error?.code === "P2002") {
        return NextResponse.json(
            { error: "Unique constraint violation" },
            { status: 409 }
        );
    }

    if (error?.code === "P2025") {
        return NextResponse.json(
            { error: "Record not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(
        { error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
    );
}
