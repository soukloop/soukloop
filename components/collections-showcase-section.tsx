"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const collections = [
  {
    id: 1,
    image: "/collections/man-formal-coat.png", // Keeping original image or need update? User didn't specify new images, just text replacements. I'll keep images for now or use placeholders if specific logic needed.
    // Actually user says "replace Groom with Sherwani in mens". Assuming just text for now as I don't have new assets.
    title: "Sherwani",
    subtitle: "Men's",
    link: "/products?query=Sherwani",
  },
  {
    id: 2,
    image: "/collections/woman-pink-gown.png",
    title: "Sherara/Gharara",
    subtitle: "Women's",
    link: "/products?query=Sherara",
  },
  {
    id: 3,
    image: "/collections/woman-argyle-vest.png",
    title: "Suit",
    subtitle: "Men's",
    link: "/products?query=Suit",
  },
  {
    id: 4,
    image: "/collections/man-gray-cardigan.png",
    title: "Saree",
    subtitle: "Women's",
    link: "/products?query=Saree",
  },
];

export default function CollectionsShowcaseSection() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 lg:gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={collection.link}
              className="group relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-2xl bg-gray-100 sm:aspect-[3/4] h-[300px] sm:h-[500px] lg:h-[600px]"
            >
              {/* Background Image */}
              <Image
                src={collection.image || "/placeholder.svg"}
                alt={collection.title}
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30" />

              {/* Content */}
              <div className="absolute bottom-4 left-4 text-white sm:bottom-8 sm:left-8">
                <h3 className="mb-1 text-xl font-bold sm:mb-2 sm:text-3xl lg:text-4xl">
                  {collection.title}
                </h3>
                <div className="flex items-center transition-transform duration-300 group-hover:translate-x-2">
                  <span className="mr-1 text-sm font-semibold text-[#e0622c] sm:mr-2 sm:text-lg">
                    {collection.subtitle}
                  </span>
                  <ArrowRight className="size-4 text-[#e0622c] sm:size-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
