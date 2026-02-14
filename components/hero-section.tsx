import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="flex w-full justify-center bg-[#FEF3EC]">
      <div className="container mx-auto flex flex-col px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center md:flex-row">
          {/* Text Section */}
          <div className="w-full py-6 text-center md:w-1/2 md:py-8 md:text-left lg:py-12">
            <h1
              className="text-3xl font-normal italic leading-snug text-gray-800 sm:text-3xl md:text-4xl lg:text-5xl"
              style={{ WebkitTextStroke: "0.5px #374151" }}
            >
              Get Up to{" "}
              <span className="not-italic text-4xl font-black text-[#008080] sm:text-4xl md:text-5xl lg:text-5xl" style={{ WebkitTextStroke: "0px" }}>20% OFF</span> on
              <br />
              <span className="">First Order</span>
            </h1>
            <p
              className="mx-auto mt-3 max-w-md text-sm font-normal text-gray-800 sm:mt-4 sm:text-lg md:mx-0 lg:text-xl"
              style={{ WebkitTextStroke: "0.3px #4B5563" }}
            >
              Your first order just got better—save up to 20% today.
            </p>
            <Link href="/products">
              <Button className="mt-6 rounded-full bg-[#E87A3F] px-6 py-4 text-sm font-semibold text-white hover:bg-[#d96d34] sm:mt-8 sm:px-10 sm:py-6 md:text-lg">
                View Product
              </Button>
            </Link>
          </div>

          {/* Image Section */}
          <div className="relative h-[200px] w-full sm:h-[280px] md:h-[332px] md:w-1/2 lg:h-[400px]">
            <Image
              src="/hero-women.png"
              alt="Group of five smiling women in pink and red outfits"
              fill
              className="object-contain object-bottom sm:scale-100 md:scale-100"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
