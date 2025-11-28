import { 
  MdKeyboardArrowLeft, 
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight 
} from "react-icons/md";

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  hasNextPage,
  hasPreviousPage
}) {
  // Tạo array các số trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7; // Số trang tối đa hiển thị

    if (totalPages <= maxVisible) {
      // Nếu tổng số trang ít, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic hiển thị thông minh
      if (currentPage <= 4) {
        // Đầu danh sách
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Cuối danh sách
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        // Giữa danh sách
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2">
      {/* First page button */}
      <button
        onClick={() => onPageChange(1)}
        disabled={!hasPreviousPage}
        className={`p-2 rounded-lg border transition-all ${
          !hasPreviousPage
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
        title="Trang đầu"
      >
        <MdKeyboardDoubleArrowLeft className="text-xl" />
      </button>

      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        className={`p-2 rounded-lg border transition-all ${
          !hasPreviousPage
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
        title="Trang trước"
      >
        <MdKeyboardArrowLeft className="text-xl" />
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-500"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[40px] px-3 py-2 rounded-lg border font-medium transition-all ${
                currentPage === page
                  ? 'bg-[#1e293b] text-white outline-[#1e293b]'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className={`p-2 rounded-lg border transition-all ${
          !hasNextPage
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
        title="Trang sau"
      >
        <MdKeyboardArrowRight className="text-xl" />
      </button>

      {/* Last page button */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={!hasNextPage}
        className={`p-2 rounded-lg border transition-all ${
          !hasNextPage
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
        title="Trang cuối"
      >
        <MdKeyboardDoubleArrowRight className="text-xl" />
      </button>

      {/* Page info */}
      <div className="ml-4 text-sm text-gray-600">
        Trang <span className="font-semibold">{currentPage}</span> / {totalPages}
      </div>
    </div>
  );
}
