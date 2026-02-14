import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { decrypt } from "@/lib/encryption"

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
        })

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
        }

        const accountsRaw = await prisma.bankAccount.findMany({
            where: { vendorId: vendor.id },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ]
        })

        const accounts = accountsRaw.map(acc => {
            let last4 = "----";
            // Decrypt if encrypted available
            if (acc.accountNumberEncrypted) {
                try {
                    const plain = decrypt(acc.accountNumberEncrypted!);
                    last4 = plain.slice(-4);
                } catch (e) { console.error("Decryption failed", e) }
            } else if (acc.accountNumber) {
                // Legacy Fallback
                last4 = acc.accountNumber.slice(-4);
            }

            return {
                ...acc,
                accountNumber: `****${last4}`, // Masked 
                accountNumberEncrypted: undefined,
                routingNumberEncrypted: undefined,
                routingNumber: acc.routingNumber ? "****" : null
            };
        });

        return NextResponse.json(accounts)

    } catch (error) {
        console.error('Bank accounts GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
