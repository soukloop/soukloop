import { NextResponse } from "next/server";
import { auth } from "@/auth";
import jwt from "jsonwebtoken";

export async function GET() {
    try {
        const centrifugoSecret = process.env.CENTRIFUGO_TOKEN_SECRET;
        if (!centrifugoSecret) {
            return NextResponse.json(
                { error: "Centrifugo token endpoint is not configured" },
                { status: 503 }
            );
        }

        const session = await auth();

        // For guest users, we can either deny or give an anonymous token
        // Centrifugo supports anonymous users if 'sub' is empty
        const userId = session?.user?.id || "";

        const token = jwt.sign(
            {
                sub: userId,
                // Expire in 24 hours
                exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
                // Grant permission to subscribe to user's personal channel and global channels
                subs: {
                    [`personal:${userId}`]: {},
                    "notifications": {},
                    "product-stock-updates": {},
                    "conversation:*": {}
                }
            },
            centrifugoSecret
        );

        return NextResponse.json({ token });
    } catch (error) {
        console.error("Error generating Centrifugo token:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
