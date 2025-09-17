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
    <div className="bg-[#f9f9f9] py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Made responsive: max-w instead of fixed width/height */}
        <div className="bg-white rounded-2xl py-12 px-6 md:px-12 shadow-sm border border-gray-100 max-w-[1248px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-start">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  index === 0
                    ? "justify-self-start sm:-ml-7"
                    : index === 1
                    ? "justify-self-start sm:-ml-7 sm:-mr-4"
                    : ""
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  <Image
                    src={feature.icon || "/placeholder.svg"}
                    alt={feature.title}
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight whitespace-nowrap">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed whitespace-nowrap">
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
