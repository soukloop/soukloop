import { notFound } from "next/navigation";
import EcommerceHeader from "@/components/ecommerce-header";
import SellerProfile from "../sellerprofile/components/seller-profile";
import ProductFilters from "../sellerprofile/components/product-filters"; // Keep as client component for now
import ProductGrid from "../sellerprofile/components/product-grid";
import FooterSection from "@/components/footer-section";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function SellerPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const sellerId = params.id as string | undefined;
  const slug = params.slug as string | undefined;

  if (!sellerId && !slug) {
    return notFound();
  }

  // Fetch Vendor Data
  const vendor = await prisma.vendor.findFirst({
    where: {
      OR: [
        { userId: sellerId }, // Assuming id passed is userId based on context, or vendorId? 
        // Admin link is usually /admin/users/[id], so id is likely userId.
        // But let's check if it finds by id (userId) or direct id. 
        // Safest is to try both or rely on specific param. 
        // For now, assuming 'id' param is the userId of the seller.
        { id: sellerId },
        { slug: slug }
      ]
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        }
      },
      _count: {
        select: {
          orders: true,
          products: true,
        }
      }
    }
  });

  if (!vendor) {
    return notFound();
  }

  // Fetch Vendor Products
  const products = await prisma.product.findMany({
    where: {
      vendorId: vendor.id,
      isActive: true, // Only show active products
    },
    include: {
      images: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20, // Limit for now
  });

  // Map products to the grid interface
  const mappedProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    originalPrice: p.comparePrice ? Number(p.comparePrice) : undefined,
    image: p.images[0]?.url || "/placeholder.svg",
    description: p.description || "",
    createdAt: p.createdAt,
  }));

  const bannerImage = vendor.banner || "/images/cover-image.png";

  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />

      {/* Banner Section */}
      <section className="relative overflow-hidden">
        <div className="relative h-[300px] md:h-[400px] bg-slate-100">
          <Image
            src={bannerImage}
            alt="Shop Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
        </div>
      </section>

      <SellerProfile vendor={vendor} />

      {/* Filters (Client Component) - Passing mock activeTab for now since it manages its own state 
          Ideall, lift state up to URL params ?tab=sold 
      */}
      {/* <ProductFilters activeTab="all" onTabChange={() => {}} /> */}

      {/* Re-using the grid but with data */}
      <ProductGrid activeTab="all" products={mappedProducts} />

      <FooterSection />
    </div>
  );
}
