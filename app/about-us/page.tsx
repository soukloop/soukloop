import EcommerceHeader from "@/components/ecommerce-header";
import TestimonialsSection from "@/components/testimonials-section";
import FooterSection from "@/components/footer-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function SoukLoopAbout() {
  return (
    <div className="min-h-screen bg-white sm:mt-[-9rem] mt-[-6.2rem]">
      <EcommerceHeader />

      {/* Hero Section */}
      <section
        className="relative min-h-[200px] sm:min-h-[400px] w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-section.png')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 flex min-h-[200px] sm:min-h-[400px] items-center justify-center px-4 text-center text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="mb-2 text-xl font-bold sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
              Wear the story. Live the loop
            </h1>
            <p className="mx-auto max-w-3xl text-xs leading-relaxed sm:text-base md:text-xl line-clamp-3 sm:line-clamp-none">
              Soukloop brings together style, comfort, and meaning—made for how
              you really live. We give pre-loved fashion a fresh start, so you
              can express yourself, shop sustainably, and find pieces that tell
              a story—just like you do.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6 text-center">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl font-normal text-gray-900 sm:text-4xl">
                  About
                </h2>
                {/* Logo aligned with text */}
                <div className="relative h-8 sm:h-10 w-32 sm:w-40">
                  <Image
                    src="/images/logo.png"
                    alt="SoukLoop"
                    fill
                    className="object-contain object-left"
                  />
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-gray-700 sm:text-base text-center mx-auto max-w-2xl">
                <p>
                  We started Soukloop with a simple belief: great clothes
                  shouldn't end up forgotten in the back of a closet—or worse,
                  in a landfill.
                </p>
                <p>
                  Soukloop is where pre-loved fashion gets a fresh start. It's a
                  space to pass on what you've loved and discover clothes that
                  feel just right—without the high price tag or the waste.
                </p>
                <p>
                  Our mission is to make second nature. Every item on Soukloop
                  has a story, and we love that you're helping write the next
                  chapter.
                </p>
                <p>
                  We're more than just a marketplace—we're a growing community
                  that cares about style, sustainability, and making smart
                  choices that still feel like you.
                </p>
                <p>Because fashion doesn't have to be fast to be exciting.</p>
                <p>And looking good shouldn't come at the planet's expense.</p>
              </div>

              <div className="flex flex-row gap-4 pt-4 justify-center">
                <Link href="/contact-us" className="w-full sm:w-auto">
                  <Button className="h-12 w-full rounded-full bg-[#e0622c] font-medium text-white hover:bg-[#c55424] sm:h-12 sm:w-[180px]">
                    Contact Us
                  </Button>
                </Link>
                <Link href="/products" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-full border-[#e0622c] bg-transparent font-medium text-[#e0622c] hover:bg-[#e0622c] hover:text-white sm:h-12 sm:w-[180px]"
                  >
                    View Products
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative w-full hidden sm:block">
              <div
                className="h-[300px] w-full overflow-hidden rounded-2xl bg-cover bg-center sm:h-[400px] lg:h-[500px] shadow-lg"
                style={{
                  backgroundImage: "url('/images/about-team-photo.png')",
                }}
              >
                <div className="size-full bg-black/10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <FooterSection />
    </div>
  );
}
