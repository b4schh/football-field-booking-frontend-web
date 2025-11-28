import { useEffect } from "react";
import { useComplexStore } from "../../store";
import ComplexCard from "./ComplexCard";
import Pagination from "./Pagination";

export default function ComplexListGrid() {
  const { complexes, pagination, fetchComplexes, isLoading, error } =
    useComplexStore();

  useEffect(() => {
    fetchComplexes({ pageIndex: 1, pageSize: 12 });
  }, []);


  const handlePageChange = (newPage) => {
    console.log("📄 Page changed to:", newPage);
    fetchComplexes({ pageIndex: newPage, pageSize: 1 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách sân...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">❌ {error}</p>
          <button
            onClick={() => fetchComplexes({ pageIndex: 1, pageSize: 12 })}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!complexes || complexes.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg">Không có cụm sân nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-20">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Danh sách sân bóng</h2>
        <p className="text-gray-600 mt-2">
          Tìm thấy {pagination.totalRecords} cụm sân
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {complexes.map((complex) => (
          <ComplexCard key={complex.id} complex={complex} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.pageIndex}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
          />
        </div>
      )}
    </div>
  );
}
