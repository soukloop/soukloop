import Image from "next/image"
import { Play } from 'lucide-react'

export default function WinterPromotionSection() {
  return (
    <div className="bg-[#f9f9f9] py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[#e0622c] text-sm font-semibold tracking-wider uppercase mb-2">PROMOTION</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4">
            <span className="text-gray-900 font-light italic">Winter</span>{" "}
            <span className="text-[#e0622c] font-bold">Collections</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Cold? Not anymore. Our new winter jackets just dropped.
          </p>
        </div>
      </div>

      {/* Video/Image Section */}
      <div className="px-4 sm:px-8 lg:px-24 pb-10">
        <div className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-100 w-full max-w-[1120px] aspect-[16/9] mx-auto">
          {/* Background Image */}
          <Image
            src="/promotions/winter-collection-video.png"
            alt="Winter Collections - Woman in purple winter jacket"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Play className="h-8 w-8 text-gray-800 ml-1" fill="currentColor" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
