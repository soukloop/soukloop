import Image from "next/image";
import { Play } from "lucide-react";

export default function WinterPromotionSection() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#e0622c]">
            PROMOTION
          </p>
          <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl">
            <span className="font-light italic text-gray-900">Winter</span>{" "}
            <span className="font-bold text-[#e0622c]">Collections</span>
          </h2>
          <p className="text-base text-gray-600 sm:text-lg">
            Cold? Not anymore. Our new winter jackets just dropped.
          </p>
        </div>
      </div>

      {/* Video/Image Section */}
      <div className="px-4 pb-10 sm:px-8 lg:px-24">
        <div className="group relative mx-auto aspect-[16/9] w-full max-w-[1000px] cursor-pointer overflow-hidden rounded-2xl bg-gray-100">
          {/* Background Image */}
          <Image
            src="/promotions/winter-collection-video.png"
            alt="Winter Collections - Woman in purple winter jacket"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/20" />

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-white p-6 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-1 size-8 text-gray-800" fill="currentColor" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
