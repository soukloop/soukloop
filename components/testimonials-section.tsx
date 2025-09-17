"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    id: 1,
    name: "Client Name",
    location: "Location",
    rating: 5,
    text: "Absolutely love this Dress! The leather feels premium, and the design is so sleek. It goes with everything and fits all my essentials—stylish and practical!",
    profileImage: "/woman-profile-1.png",
    productImage: "/testimonials/pink-pleated-dress.png",
  },
  {
    id: 2,
    name: "Client Name",
    location: "Location",
    rating: 5,
    text: "Absolutely love this Dress! The leather feels premium, and the design is so sleek. It goes with everything and fits all my essentials—stylish and practical!",
    profileImage: "/woman-profile-2.png",
    productImage: "/testimonials/handbag-beige.png",
  },
  {
    id: 3,
    name: "Client Name",
    location: "Location",
    rating: 5,
    text: "Absolutely love this bag! The leather feels premium, and the design is so sleek. It goes with everything and fits all my essentials—stylish and practical!",
    profileImage: "/woman-profile-3.png",
    productImage: "/testimonials/pink-coat.png",
  },
  {
    id: 4,
    name: "Client Name",
    location: "Location",
    rating: 5,
    text: "Absolutely love this product! The quality feels premium, and the design is so sleek. It goes with everything and fits all my essentials—stylish and practical!",
    profileImage: "/woman-profile-4.png",
    productImage: "/testimonials/white-dress.png",
  },
  {
    id: 5,
    name: "Client Name",
    location: "Location",
    rating: 5,
    text: "Absolutely love this item! The quality feels premium, and the design is so sleek. It goes with everything and fits all my essentials—stylish and practical!",
    profileImage: "/woman-profile-1.png",
    productImage: "/testimonials/pink-pleated-dress.png",
  },
]

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(true)

  const extendedTestimonials = [...testimonials, ...testimonials, ...testimonials]

  // Responsive widths
  const baseCardWidth = 280 // mobile base
  const gap = 24
  const slideWidth = baseCardWidth + gap

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => prev + 1)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => prev - 1)
  }, [])

  useEffect(() => {
    if (currentIndex >= testimonials.length * 2) {
      setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(testimonials.length)
        setTimeout(() => setIsTransitioning(true), 50)
      }, 500)
    } else if (currentIndex <= 0) {
      setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(testimonials.length)
        setTimeout(() => setIsTransitioning(true), 50)
      }, 500)
    }
  }, [currentIndex])

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  useEffect(() => {
    setCurrentIndex(testimonials.length)
  }, [])

  return (
    <div className="bg-[#f9f9f9] py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4">
            <span className="text-gray-900 font-light italic">Clients</span>{" "}
            <span className="text-[#e0622c] font-bold">Testimonials</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Our clients' success is our pride, hear what they have to say.
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative mb-12 overflow-hidden">
          <div className="flex justify-center">
            <div
              className={`flex gap-6 ${isTransitioning ? "transition-transform duration-500 ease-in-out" : ""}`}
              style={{
                transform: `translateX(-${currentIndex * slideWidth}px)`,
                width: `${extendedTestimonials.length * slideWidth}px`,
              }}
            >
              {extendedTestimonials.map((testimonial, index) => (
                <div
                  key={`${testimonial.id}-${index}`}
                  className="flex-shrink-0 w-[85vw] sm:w-[320px] md:w-[340px] lg:w-[365px]"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-sm h-auto min-h-[360px] sm:min-h-[380px]">
                    {/* Profile */}
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                        <Image
                          src={testimonial.profileImage || "/placeholder.svg"}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h3>
                        <p className="text-gray-500 text-xs mb-1">{testimonial.location}</p>
                        <div className="flex items-center">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-[#e0622c] fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-gray-700 text-sm mb-4 leading-relaxed">{testimonial.text}</p>

                    {/* Product Image */}
                    <div className="aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden">
                      <Image
                        src={testimonial.productImage || "/placeholder.svg"}
                        alt="Product"
                        width={288}
                        height={216}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center space-x-4">
          <Button
            onClick={prevSlide}
            size="icon"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F4C2A7] hover:bg-[#F0B89A] text-white border-0 shadow-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            onClick={nextSlide}
            size="icon"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#E87A3F] hover:bg-[#d96d34] text-white border-0 shadow-none"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
