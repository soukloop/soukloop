import { Button } from "@/components/ui/button"

export default function CTAButtonsSection() {
  return (
    <div className="bg-[#f9f9f9] py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Flex row on mobile, column on larger screens */}
        <div className="flex flex-row sm:flex-col justify-center items-center gap-6">
          <Button className="bg-[#e0622c] hover:bg-[#c55424] text-white rounded-full text-base font-semibold w-[240px] h-[56px]">
            View All Products
          </Button>
          <Button
            variant="outline"
            className="bg-[#f5e6e0] border-[#f5e6e0] text-[#e0622c] hover:bg-[#f0ddd4] w-[179px] h-[56px] rounded-full text-base font-semibold"
          >
            About Us
          </Button>
        </div>
      </div>
    </div>
  )
}
