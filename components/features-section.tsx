import Image from "next/image"

export default function FeaturesSection() {
  const features = [
    {
      icon: "/icons/box.svg",
      title: "Discount",
      description: "Every week new sales",
    },
    {
      icon: "/icons/delivery-truck.svg",
      title: "Free Delivery",
      description: "100% Free for $100 or above order",
    },
    {
      icon: "/icons/24-hours.svg",
      title: "Great Support 24/7",
      description: "We care your experiences",
    },
    {
      icon: "/icons/shield.svg",
      title: "Secure Payment",
      description: "100% Secure Payment Method",
    },
  ]

  return (
    <div className="bg-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Full width to match standard page layout components */}
        <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-6 shadow-md md:px-12">
          {/* Mobile: Stacked 2 per row (grid-cols-2) */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:space-x-3"
              >
                <div className="mt-1 shrink-0 mb-2 sm:mb-0">
                  <Image
                    src={feature.icon || "/placeholder.svg"}
                    alt={feature.title}
                    width={40}
                    height={40}
                    className="size-8 sm:size-10"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 whitespace-nowrap text-xs sm:text-sm font-bold leading-tight text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="whitespace-normal text-[10px] sm:text-xs leading-relaxed text-gray-600 sm:whitespace-nowrap">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
