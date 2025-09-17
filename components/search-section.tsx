import { MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SearchSection() {
  return (
    <div className="bg-[#fdf7f4] py-8">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 max-w-5xl mx-auto">
          {/* Country Selector */}
          <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow w-full md:w-[250px] lg:w-[300px] px-4 py-3">
            <MapPin className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-700 font-medium text-sm sm:text-base">Select Country</span>
            <ChevronDown className="h-4 w-4 text-gray-500 ml-auto" />
          </div>

          {/* Search Input */}
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Find cars, fashion, grocery and more..."
              className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E87A3F] focus:border-transparent text-gray-700 placeholder-gray-500 text-sm sm:text-base"
            />
          </div>

          {/* Search Button */}
          <Button className="w-full md:w-auto bg-[#E87A3F] hover:bg-[#d96d34] text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base shadow-sm hover:shadow-md transition-all h-[50px] sm:h-[56px]">
            Search
          </Button>
        </div>
      </div>
    </div>
  )
}
