import EcommerceHeader from "@/components/ecommerce-header"
import TestimonialsSection from "@/components/testimonials-section"
import FooterSection from "@/components/footer-section"
import { Button } from "@/components/ui/button"

export default function SoukLoopAbout() {
  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />

      {/* Hero Section */}
      <section
  className="relative min-h-[250px] w-full bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('/images/hero-section.png')" }}
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/40"></div>

  {/* Content */}
  <div className="relative z-10 flex items-center justify-center min-h-[400px] text-center text-white px-4">
    <div className="max-w-4xl">
      <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
        Wear the story. Live the loop
      </h1>
      <p className="text-sm sm:text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
        Soukloop brings together style, comfort, and meaning—made for how you really live. We give pre-loved
        fashion a fresh start, so you can express yourself, shop sustainably, and find pieces that tell a
        story—just like you do.
      </p>
    </div>
  </div>
</section>


      {/* About SoukLoop Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900">
                About <span className="text-[#e0622c]">SoukLoop</span>
              </h2>

              <div className="space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
                <p>
                  We started Soukloop with a simple belief: great clothes shouldn't end up forgotten in the back of a
                  closet—or worse, in a landfill.
                </p>
                <p>
                  Soukloop is where pre-loved fashion gets a fresh start. It's a space to pass on what you've loved and
                  discover clothes that feel just right—without the high price tag or the waste.
                </p>
                <p>
                  Our mission is to make second nature. Every item on Soukloop has a story, and we love that you're
                  helping write the next chapter.
                </p>
                <p>
                  We're more than just a marketplace—we're a growing community that cares about style, sustainability,
                  and making smart choices that still feel like you.
                </p>
                <p>Because fashion doesn't have to be fast to be exciting.</p>
                <p>And looking good shouldn't come at the planet's expense.</p>
              </div>

              <div className="flex flex-row sm:flex-row gap-4 pt-4">
                <Button className="bg-[#e0622c] hover:bg-[#c55424] text-white font-medium w-full sm:w-[200px] h-12 sm:h-14 rounded-full">
                  Contact Us
                </Button>
                <Button
                  variant="outline"
                  className="border-[#e0622c] text-[#e0622c] hover:bg-[#e0622c] hover:text-white font-medium bg-transparent w-full sm:w-[200px] h-12 sm:h-14 rounded-full"
                >
                  View Products
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative w-full">
              <div
                className="bg-cover bg-center overflow-hidden w-full h-[350px] sm:h-[360px] md:h-[500px] lg:h-[622px] rounded-lg"
                style={{ backgroundImage: "url('/images/about-team-photo.png')" }}
              >
                <div className="w-full h-full bg-gradient-to-br from-transparent to-black/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
  <div className="max-w-7xl mx-auto">
    <div className="mb-12 text-center md:text-left">
      <h2 className="text-3xl sm:text-5xl font-bold text-black mb-6">
        Meet <span className="text-[#e0622c]">Our team</span>
      </h2>
      <p className="text-base sm:text-lg text-gray-700 max-w-4xl mx-auto md:mx-0">
        Meet the Soukloop team — a small crew with big hearts, passionate about fashion, sustainability,
        and making secondhand the first choice.
      </p>
    </div>

    {/* Column on mobile, horizontal row on tablet/desktop */}
    <div className="flex flex-col items-center md:items-stretch md:flex-row md:flex-nowrap md:overflow-x-auto md:scrollbar-hide gap-8 md:gap-6">
      {/* Team Member 1 */}
      <div className="flex-shrink-0 w-full md:w-[400px] text-center md:text-left">
        <div className="w-24 sm:w-28 h-24 sm:h-28 bg-gray-200 rounded-full mb-6 sm:mb-8 overflow-hidden mx-auto md:mx-0">
          <img
            src="/professional-woman-headshot.png"
            alt="Team member"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-bold text-lg sm:text-xl text-black mb-2">Full name</h3>
        <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Job title</p>
        <p className="text-gray-700 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
        </p>
        <div className="flex justify-center md:justify-start gap-4">
          {/* LinkedIn */}
          <a href="#" aria-label="LinkedIn" className="text-gray-600 hover:text-[#0A66C2]">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
            </svg>
          </a>
          {/* Twitter/X */}
          <a href="#" aria-label="Twitter" className="text-gray-600 hover:text-black">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.8l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          {/* Instagram */}
          <a href="#" aria-label="Instagram" className="text-gray-600 hover:text-pink-500">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 4a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.5-.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Team Member 2 */}
      <div className="flex-shrink-0 w-full md:w-[400px] text-center md:text-left">
        <div className="w-24 sm:w-28 h-24 sm:h-28 bg-gray-200 rounded-full mb-6 sm:mb-8 overflow-hidden mx-auto md:mx-0">
          <img
            src="/professional-man-headshot.png"
            alt="Team member"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-bold text-lg sm:text-xl text-black mb-2">Full name</h3>
        <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Job title</p>
        <p className="text-gray-700 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
        </p>
        <div className="flex justify-center md:justify-start gap-4">
          <a href="#" aria-label="LinkedIn" className="text-gray-600 hover:text-[#0A66C2]">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>
          </a>
          <a href="#" aria-label="Twitter" className="text-gray-600 hover:text-black">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.8l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" aria-label="Instagram" className="text-gray-600 hover:text-pink-500">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 4a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.5-.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/></svg>
          </a>
        </div>
      </div>

      {/* Team Member 3 */}
      <div className="flex-shrink-0 w-full md:w-[400px] text-center md:text-left">
        <div className="w-24 sm:w-28 h-24 sm:h-28 bg-gray-200 rounded-full mb-6 sm:mb-8 overflow-hidden mx-auto md:mx-0">
          <img
            src="/professional-headshot.png"
            alt="Team member"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-bold text-lg sm:text-xl text-black mb-2">Full name</h3>
        <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Job title</p>
        <p className="text-gray-700 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
        </p>
        <div className="flex justify-center md:justify-start gap-4">
          <a href="#" aria-label="LinkedIn" className="text-gray-600 hover:text-[#0A66C2]">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>
          </a>
          <a href="#" aria-label="Twitter" className="text-gray-600 hover:text-black">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.8l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" aria-label="Instagram" className="text-gray-600 hover:text-pink-500">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 4a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.5-.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/></svg>
          </a>
        </div>
      </div>

      {/* Team Member 4 */}
      <div className="flex-shrink-0 w-full md:w-[400px] text-center md:text-left">
        <div className="w-24 sm:w-28 h-24 sm:h-28 bg-gray-200 rounded-full mb-6 sm:mb-8 overflow-hidden mx-auto md:mx-0">
          <img
            src="/professional-woman-headshot.png"
            alt="Team member"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-bold text-lg sm:text-xl text-black mb-2">Full name</h3>
        <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Job title</p>
        <p className="text-gray-700 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
        </p>
        <div className="flex justify-center md:justify-start gap-4">
          <a href="#" aria-label="LinkedIn" className="text-gray-600 hover:text-[#0A66C2]">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>
          </a>
          <a href="#" aria-label="Twitter" className="text-gray-600 hover:text-black">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.8l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" aria-label="Instagram" className="text-gray-600 hover:text-pink-500">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 4a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.5-.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/></svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>


      <TestimonialsSection />
      <FooterSection />
    </div>
  )
}
