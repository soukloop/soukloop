export default function ShopByPriceSection() {
  const priceRanges = [
    { label: "Under", price: "$10", range: "under-10" },
    { label: "Under", price: "$20", range: "under-20" },
    { label: "Under", price: "$30", range: "under-30" },
  ];

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 w-[224px] h-[36px] mx-auto">
            Shop by price
          </h2>
        </div>

        {/* Price Range Cards */}
        <div
          className="
            flex flex-col sm:flex-row 
            sm:justify-center sm:items-center 
            gap-6 sm:gap-8 
            max-w-fit mx-auto 
            sm:overflow-x-auto sm:scrollbar-hide
          "
        >
          {priceRanges.map((range, index) => (
            <div
              key={index}
              className="
                bg-[#f9f9f9] rounded-2xl shadow-sm hover:shadow-md 
                transition-shadow cursor-pointer group 
                w-[80vw] sm:w-[300px] md:w-[350px] lg:w-[400px] 
                h-[150px] sm:h-[180px] 
                flex items-center justify-center flex-shrink-0
              "
            >
              <div className="text-center">
                <span className="text-3xl text-gray-700 font-normal">
                  {range.label}{" "}
                </span>
                <span className="text-3xl text-gray-900 font-bold">
                  {range.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
