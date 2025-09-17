import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <div className="bg-[#FEF3EC] w-full flex justify-center">
      <div className="w-full max-w-[1440px] flex flex-col">
        <div className="flex flex-row md:flex-row items-center">
          {/* Text Section */}
          <div className="md:w-1/2 w-full text-center md:text-left px-4 sm:px-6 lg:px-12 py-10 md:py-16">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-800 leading-snug italic"
              style={{ fontFamily: "Geomanist, sans-serif" }}
            >
              Get Up to{" "}
              <span className="font-bold text-[#008080]">20% OFF</span> on
              <br />
              <span className="italic">First Order</span>
            </h1>
            <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-md mx-auto md:mx-0">
              Your first order just got better—save up to 20% today.
            </p>
            <Button className="mt-6 sm:mt-8 bg-[#E87A3F] hover:bg-[#d96d34] text-white rounded-full px-6 sm:px-10 py-3 sm:py-6 text-sm sm:text-base font-semibold">
              View Products
            </Button>
          </div>

          {/* Image Section */}
          <div className="md:w-1/2 w-full h-[250px] sm:h-[320px] md:h-[400px] lg:h-[500px] relative">
            <Image
              src="/hero-women.png"
              alt="Group of five smiling women in pink and red outfits"
              fill
              className="object-contain object-center md:object-right-bottom"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
