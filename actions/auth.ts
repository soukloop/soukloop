"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Triggers a session revalidation.
 * This should be called by any Server Action that mutates user roles or data.
 */
export async function refreshSession() {
    const session = await auth();
    if (!session) return;

    // Revalidate the entire layout to force layout.tsx to re-fetch session
    revalidatePath("/", "layout");

    return { success: true };
}
