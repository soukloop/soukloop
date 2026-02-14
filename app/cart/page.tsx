import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CartFlow from "./components/cart-flow";
import { Suspense } from "react";
import { Address } from "@prisma/client";
import { getCart } from "@/features/cart/queries";
import FooterSection from "@/components/footer-section";
import { CartSkeleton } from "./components/skeletons";

export const dynamic = 'force-dynamic';

async function CartContent() {
  const session = await auth();

  // Artificial delay to demonstrate skeleton if needed, but best to remove for production speed
  // await new Promise(resolve => setTimeout(resolve, 1000));

  let savedAddresses: Address[] = [];
  let cartData = null;

  if (session?.user?.id) {
    // Parallel fetch for optimal performance
    const [userWithAddresses, cart] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        include: { addresses: true }
      }),
      getCart(session.user.id)
    ]);

    if (userWithAddresses?.addresses) {
      savedAddresses = userWithAddresses.addresses;
    }
    cartData = cart;
  }

  return <CartFlow savedAddresses={savedAddresses} initialCartData={cartData} />;
}

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <Suspense fallback={<CartSkeleton />}>
        <CartContent />
      </Suspense>

      <div className="mt-auto">
        <FooterSection />
      </div>
    </div>
  );
}
