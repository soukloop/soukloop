import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import BecomeSellerCTA from "@/components/become-seller-cta";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import ListingList from "./listing-list";
import { stripe } from "@/lib/stripe";

interface ManageListingsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ManageListingsPage({ searchParams }: ManageListingsPageProps) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/signin");
    }

    // Role check and Vendor load
    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id }
    });

    if (!vendor) {
        return (
            <div className="flex min-h-screen flex-col bg-white">
                <EcommerceHeader />
                <BecomeSellerCTA />
                <FooterSection />
            </div>
        );
    }

    const params = await searchParams;

    // --- STRIPE SESSION VERIFICATION (Synchronous Fallback for Boosts) ---
    const sessionId = params.session_id as string;
    if (sessionId) {
        try {
            const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
            if (stripeSession.payment_status === 'paid' && stripeSession.metadata?.boostId) {
                const boostId = stripeSession.metadata.boostId;
                const vendorId = stripeSession.metadata.vendorId;

                const pendingBoost = await prisma.productBoost.findUnique({
                    where: { id: boostId },
                    include: {
                        product: {
                            select: {
                                isActive: true,
                                status: true,
                                dressStyle: { select: { status: true } }
                            }
                        }
                    }
                });

                if (pendingBoost && (pendingBoost.status === 'pending_payment' || pendingBoost.status === 'pending')) {
                    // Start atomic sync transaction
                    await prisma.$transaction(async (tx) => {
                        // Idempotency check via transaction table
                        const existingTransaction = await tx.boostTransaction.findUnique({
                            where: { stripePaymentId: stripeSession.payment_intent as string }
                        });

                        if (!existingTransaction) {
                            await tx.boostTransaction.create({
                                data: {
                                    boostId,
                                    vendorId: vendorId as string,
                                    stripePaymentId: stripeSession.payment_intent as string,
                                    amount: stripeSession.amount_total ? stripeSession.amount_total / 100 : 0,
                                    status: 'succeeded'
                                }
                            });

                            const dressStyleApproved = !pendingBoost.product.dressStyle || pendingBoost.product.dressStyle.status === 'approved';
                            const productIsLive = pendingBoost.product.isActive && pendingBoost.product.status !== 'DRAFT' && pendingBoost.product.status !== 'BLOCKED' && dressStyleApproved;

                            if (productIsLive) {
                                const startDate = new Date();
                                let durationMs = 3 * 24 * 60 * 60 * 1000;
                                if (pendingBoost.packageType === '7_DAYS') durationMs = 7 * 24 * 60 * 60 * 1000;
                                else if (pendingBoost.packageType === '15_DAYS') durationMs = 15 * 24 * 60 * 60 * 1000;

                                await tx.productBoost.update({
                                    where: { id: boostId },
                                    data: {
                                        status: 'active',
                                        stripeSessionId: stripeSession.id,
                                        startDate,
                                        endDate: new Date(startDate.getTime() + durationMs)
                                    }
                                });
                            } else {
                                await tx.productBoost.update({
                                    where: { id: boostId },
                                    data: {
                                        status: 'paid',
                                        stripeSessionId: stripeSession.id
                                    }
                                });
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Stripe Sync Error for Boosts:', error);
        }
    }
    // ---------------------------------------------------------------------

    const currentPage = parseInt((params.page as string) || "1");
    const limit = 6;
    const skip = (currentPage - 1) * limit;

    const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
            where: { vendorId: vendor.id },
            include: {
                images: true,
                vendor: {
                    select: {
                        userId: true
                    }
                },
                boosts: {
                    where: { status: 'active' },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.product.count({
            where: { vendorId: vendor.id }
        })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="mx-auto w-full max-w-[1920px] bg-white min-h-screen flex flex-col font-sans sm:mt-[-4rem] mt-[-3rem]">
            <EcommerceHeader />

            <div className="flex flex-1 flex-col" style={{ backgroundColor: "#f9f9f9" }}>
                <div className="container mx-auto px-4 pt-24 pb-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            Manage Listings
                        </h1>
                        <Link href="/seller/post-new-product">
                            <Button
                                className="h-10 rounded-full bg-[#E87A3F] px-6 text-sm font-bold text-white transition-colors hover:bg-[#d16a32] sm:h-12 sm:px-8 sm:text-base shadow-[0px_4px_10px_0px_rgba(232,122,63,0.2)]"
                            >
                                Add New
                            </Button>
                        </Link>
                    </div>

                    <ListingList
                        products={products.map(p => ({
                            ...p,
                            price: p.price,
                            comparePrice: p.comparePrice,
                            createdAt: p.createdAt.toISOString(),
                        })) as any}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        userId={session.user.id}
                    />
                </div>
            </div>

            <FooterSection />
        </div>
    );
}
