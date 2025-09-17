import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Premium Leather Bag",
    price: 199.99,
    originalPrice: 299.99,
    image: "/tan-leather-thankyou-handbag.png", // Updated to use tan leather handbag image
    description: "A timeless striped design meets tailored elegance...",
  },
  {
    id: 2,
    name: "Premium Leather Bag",
    price: 199.99,
    originalPrice: 299.99,
    image: "/white-quilted-butterfly-handbag.png", // Updated to use white quilted butterfly handbag
    description: "A timeless striped design meets tailored elegance...",
  },
  {
    id: 3,
    name: "Premium Leather Bag",
    price: 199.99,
    originalPrice: 299.99,
    image: "/cherry-pattern-handbag.png", // Updated to use cherry pattern handbag
    description: "A timeless striped design meets tailored elegance...",
  },
  {
    id: 4,
    name: "Premium Leather Bag",
    price: 199.99,
    originalPrice: 299.99,
    image: "/tan-leather-thankyou-handbag.png", // Updated to use tan leather handbag image
    description: "A timeless striped design meets tailored elegance...",
  },
  {
    id: 5,
    name: "Premium Leather Bag",
    price: 199.99,
    originalPrice: 299.99,
    image: "/white-quilted-butterfly-handbag.png", // Updated to use white quilted butterfly handbag
    description: "A timeless striped design meets tailored elegance...",
  },
  {
    id: 6,
    name: "Premium Leather Bag",
    price: 199.99,
    originalPrice: 299.99,
    image: "/cherry-pattern-handbag.png", // Updated to use cherry pattern handbag
    description: "A timeless striped design meets tailored elegance...",
  },
]

interface ProductGridProps {
  activeTab: "all" | "sold"
}

export default function ProductGrid({ activeTab }: ProductGridProps) {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden group">
              <div className="relative">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-2">4 days ago</p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">${product.price}</span>
                    <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                  </div>
                  <Heart className="w-6 h-6 text-red-500 fill-current" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                <Button
                  className={`rounded-lg w-full ${
                    activeTab === "sold"
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-[#e0622c] hover:bg-[#d96d34] text-white"
                  }`}
                  style={{ height: "48px" }}
                  disabled={activeTab === "sold"}
                >
                  {activeTab === "sold" ? "Sold Out" : "Add to cart"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <Button
            variant="outline"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border-gray-300 bg-transparent w-full sm:w-auto"
          >
            <span>← Previous</span>
          </Button>

          <div className="flex items-center space-x-2 overflow-x-auto py-2">
            <Button className="bg-[#e0622c] text-white w-10 h-10 rounded-lg">1</Button>
            <Button variant="outline" className="w-10 h-10 rounded-lg border-gray-300 bg-transparent">
              2
            </Button>
            <Button variant="outline" className="w-10 h-10 rounded-lg border-gray-300 bg-transparent">
              3
            </Button>
            <span className="px-2">...</span>
            <Button variant="outline" className="w-10 h-10 rounded-lg border-gray-300 bg-transparent">
              67
            </Button>
            <Button variant="outline" className="w-10 h-10 rounded-lg border-gray-300 bg-transparent">
              68
            </Button>
          </div>

          <Button
            variant="outline"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border-gray-300 bg-transparent w-full sm:w-auto"
          >
            <span>Next →</span>
          </Button>
        </div>
      </div>
    </section>
  )
}