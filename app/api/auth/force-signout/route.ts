import { signOut } from "@/auth";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const error = searchParams.get("error") || "SessionExpired";

    // This is a Route Handler, so we CAN modify cookies here.
    await signOut({
        redirectTo: `/?error=${error}`,
        redirect: true
    });
}
