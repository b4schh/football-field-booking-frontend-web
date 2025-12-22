export default function LoadingSkeleton({ type = "table", rows = 5 }) {
  if (type === "table") {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="h-10 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(rows)].map((_, index) => (
            <div key={index} className="px-6 py-4 flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/5 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-1/2 animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>
    );
  }

  if (type === "form") {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        {[...Array(rows)].map((_, index) => (
          <div key={index}>
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
