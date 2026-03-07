
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

// Schema for validation
const RewardSettingsSchema = z.object({
    BUYER_REWARD_RATE: z.string().transform((v) => parseFloat(v)),
    SELLER_REWARD_RATE: z.string().transform((v) => parseFloat(v)),
    POINT_VALUE_USD: z.string().transform((v) => parseFloat(v)),
});

import { requirePermission } from "@/lib/admin/permissions";

// GET: Fetch current settings
export async function GET(req: Request) {
    try {
        const session = await auth();
        const adminId = session?.user?.id;
        if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await requirePermission(adminId, 'settings', 'view');

        const settings = await prisma.settings.findMany({
            where: {
                key: { in: ['BUYER_REWARD_RATE', 'SELLER_REWARD_RATE', 'POINT_VALUE_USD'] }
            }
        });

        // Convert array to object
        const config = {
            BUYER_REWARD_RATE: 1.0,
            SELLER_REWARD_RATE: 1.0,
            POINT_VALUE_USD: 0.01
        };

        settings.forEach(s => {
            if (s.key in config) {
                config[s.key as keyof typeof config] = parseFloat(s.value);
            }
        });

        return NextResponse.json(config);
    } catch (error: any) {
        console.error("Failed to fetch settings:", error);
        if (error.message.includes("Permission denied")) {
            return NextResponse.json({ error: "Permission Denied" }, { status: 403 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Update settings
export async function POST(req: Request) {
    try {
        const session = await auth();
        const adminId = session?.user?.id;
        if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await requirePermission(adminId, 'settings', 'edit');

        const body = await req.json();
        const validated = RewardSettingsSchema.parse(body);

        // Upsert each setting
        await prisma.$transaction([
            prisma.settings.upsert({
                where: { key: 'BUYER_REWARD_RATE' },
                update: { value: validated.BUYER_REWARD_RATE.toString() },
                create: { key: 'BUYER_REWARD_RATE', value: validated.BUYER_REWARD_RATE.toString() }
            }),
            prisma.settings.upsert({
                where: { key: 'SELLER_REWARD_RATE' },
                update: { value: validated.SELLER_REWARD_RATE.toString() },
                create: { key: 'SELLER_REWARD_RATE', value: validated.SELLER_REWARD_RATE.toString() }
            }),
            prisma.settings.upsert({
                where: { key: 'POINT_VALUE_USD' },
                update: { value: validated.POINT_VALUE_USD.toString() },
                create: { key: 'POINT_VALUE_USD', value: validated.POINT_VALUE_USD.toString() }
            })
        ]);

        return NextResponse.json({ success: true, settings: validated });
    } catch (error) {
        console.error("Failed to update settings:", error);
        return NextResponse.json({ error: "Invalid Input" }, { status: 400 });
    }
}
