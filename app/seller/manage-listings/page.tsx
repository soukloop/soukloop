import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import BecomeSellerCTA from "@/components/become-seller-cta";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import ListingList from "./listing-list";

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
        <div className="mx-auto w-full max-w-[1920px] bg-white min-h-screen flex flex-col font-sans">
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
