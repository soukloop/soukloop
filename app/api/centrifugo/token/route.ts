import { NextResponse } from "next/server";
import { auth } from "@/auth";
import jwt from "jsonwebtoken";

if (!process.env.CENTRIFUGO_TOKEN_SECRET) {
    throw new Error("CENTRIFUGO_TOKEN_SECRET is not set");
}
const CENTRIFUGO_SECRET = process.env.CENTRIFUGO_TOKEN_SECRET;

export async function GET() {
    try {
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
            CENTRIFUGO_SECRET
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
