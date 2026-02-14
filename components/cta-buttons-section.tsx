import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CTAButtonsSection() {
  return (
    <div className="bg-[#f9f9f9] py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Flex column on mobile, row on larger screens */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <Link href="/products">
            <Button className="h-[56px] w-[240px] rounded-full bg-[#e0622c] text-base font-semibold text-white hover:bg-[#c55424]">
              View All Products
            </Button>
          </Link>
          <Link href="/about-us">
            <Button
              variant="outline"
              className="h-[56px] w-[179px] rounded-full border-[#f5e6e0] bg-[#f5e6e0] text-base font-semibold text-[#e0622c] hover:bg-[#f0ddd4]"
            >
              About Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
