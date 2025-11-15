const ProductListSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Shimmer */}
      <div className="text-center mb-8">
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-64 mx-auto mb-2 bg-[length:200%_100%] animate-shimmer"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-48 mx-auto bg-[length:200%_100%] animate-shimmer"></div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-24 bg-[length:200%_100%] animate-shimmer"
          ></div>
        ))}
      </div>

      {/* Product Grid with Shimmer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
            
            <div className="p-4">
              <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-32 mb-2 bg-[length:200%_100%] animate-shimmer"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-20 mb-3 bg-[length:200%_100%] animate-shimmer"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-20 bg-[length:200%_100%] animate-shimmer"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-12 bg-[length:200%_100%] animate-shimmer"></div>
              </div>
              <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-full bg-[length:200%_100%] animate-shimmer"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-10 bg-[length:200%_100%] animate-shimmer"
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ProductListSkeleton;