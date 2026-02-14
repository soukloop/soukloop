"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  text: string;
  profileImage: string | null;
  productImage: string | null;
}

// Fallback testimonials for when database is empty
const fallbackTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    location: "New York",
    rating: 5,
    text: "Absolutely love this bag! The leather feels premium, and the design is so sleek. It goes with everything and fits all my essentials—stylish and practical!",
    profileImage: "/woman-profile-1.png",
    productImage: "/testimonials/handbag-beige.png",
  },
  {
    id: "2",
    name: "Emma Williams",
    location: "London",
    rating: 5,
    text: "Absolutely love this Dress! The fabric feels premium, and the design is so elegant. Perfect for any occasion—stylish and comfortable!",
    profileImage: "/woman-profile-2.png",
    productImage: "/testimonials/pink-pleated-dress.png",
  },
  {
    id: "3",
    name: "Maria Garcia",
    location: "Los Angeles",
    rating: 5,
    text: "Amazing quality! The coat is exactly what I was looking for. Warm, stylish, and the color is beautiful. Highly recommend!",
    profileImage: "/woman-profile-3.png",
    productImage: "/testimonials/pink-coat.png",
  },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch('/api/testimonials?limit=10');
        if (res.ok) {
          const data = await res.json();
          // Use DB data if available, otherwise fallback
          setTestimonials(data.length > 0 ? data : fallbackTestimonials);
        } else {
          setTestimonials(fallbackTestimonials);
        }
      } catch (error) {
        console.error('[Testimonials] Failed to fetch:', error);
        setTestimonials(fallbackTestimonials);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTestimonials();
  }, []);

  // Triple the testimonials for seamless infinite loop
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  if (isLoading) {
    return (
      <div className="bg-white py-16 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl">
            <span className="font-light italic text-gray-900">Clients</span>{" "}
            <span className="font-bold text-[#e0622c]">Testimonials</span>
          </h2>
        </div>
        <div className="flex gap-6 px-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[280px] sm:w-[320px] shrink-0 animate-pulse">
              <div className="h-full rounded-3xl bg-white p-5 border border-gray-100">
                {/* Profile Skeleton */}
                <div className="mb-4 flex items-center">
                  <div className="mr-4 size-14 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
                {/* Text Skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-5/6 bg-gray-200 rounded" />
                  <div className="h-3 w-4/6 bg-gray-200 rounded" />
                </div>
                {/* Image Skeleton */}
                <div className="aspect-[4/3] w-full bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-16 overflow-hidden">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl">
          <span className="font-light italic text-gray-900">Clients</span>{" "}
          <span className="font-bold text-[#e0622c]">Testimonials</span>
        </h2>
        <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg">
          Our clients&apos; success is our pride, hear what they have to say.
        </p>
      </div>

      {/* Infinite Auto-Scrolling Carousel */}
      <div className="relative overflow-hidden">
        <div className="animate-testimonial-slide inline-flex gap-6">
          {duplicatedTestimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.id}-${index}`}
              className="w-[280px] shrink-0 sm:w-[320px]"
              aria-hidden={index >= testimonials.length ? "true" : undefined}
            >
              <div className="h-full rounded-3xl bg-[#FAFAFA] p-5 border border-gray-100/50 hover:shadow-md transition-shadow">
                {/* Profile */}
                <div className="mb-4 flex items-center">
                  <div className="mr-4 size-14 shrink-0 overflow-hidden rounded-full border border-gray-200">
                    <Image
                      src={testimonial.profileImage || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={56}
                      height={56}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {testimonial.name}
                    </h3>
                    <p className="mb-1 text-xs text-gray-500">
                      {testimonial.location || "Customer"}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="size-4 fill-[#FFB800] text-[#FFB800]"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Testimonial Text */}
                <p className="mb-3 text-xs leading-relaxed text-gray-600">
                  {testimonial.text}
                </p>

                {/* Product Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-50">
                  <Image
                    src={testimonial.productImage || "/placeholder.svg"}
                    alt="Product"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes testimonial-slide {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(calc(-100% / 3), 0, 0);
          }
        }

        .animate-testimonial-slide {
          animation: testimonial-slide 30s linear infinite;
          will-change: transform;
        }

        /* Pause animation on hover for better UX */
        .animate-testimonial-slide:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
