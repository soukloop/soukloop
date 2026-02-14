import Image from "next/image"
import { ArrowRight } from 'lucide-react'

export default function StyleCollectionsSection() {
  const collections = [
    {
      id: 1,
      image: "/collections/woman-argyle-vest.png",
      title: "By Occasion",
      subtitle: "Collections",
      link: "/collections/occasion",
    },
    {
      id: 2,
      image: "/collections/man-gray-cardigan.png",
      title: "Shop by Style",
      subtitle: "Collections",
      link: "/collections/style",
    },
  ]

  return (
    <div className="bg-[#f9f9f9] py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl bg-gray-100 
              p-8 sm:p-12 md:p-20 lg:p-[160px]"
            >
              {/* Background Image */}
              <Image
                src={collection.image || "/placeholder.svg"}
                alt={collection.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30" />

              {/* Content */}
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="mb-2 text-2xl font-bold sm:text-3xl lg:text-4xl">{collection.title}</h3>
                <div className="flex items-center transition-transform duration-300 group-hover:translate-x-2">
                  <span className="mr-2 text-base font-semibold text-[#e0622c] sm:text-lg">{collection.subtitle}</span>
                  <ArrowRight className="size-4 text-[#e0622c] sm:size-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
