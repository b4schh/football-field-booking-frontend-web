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
  hasPreviousPage,
  pageSize = 10,
  onPageSizeChange,
  totalRecords = 0
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

  const pageSizeOptions = [5, 10, 20, 50, 100];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Page size selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm">
            <label className="text-sm text-gray-700 font-semibold whitespace-nowrap">Hiển thị:</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all cursor-pointer hover:border-slate-400"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-sm text-gray-600 whitespace-nowrap">bản ghi</span>
          </div>
        )}

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* First page button */}
          <button
            onClick={() => onPageChange(1)}
            disabled={!hasPreviousPage}
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              !hasPreviousPage
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-slate-600 hover:text-white hover:border-slate-600 hover:shadow-md active:scale-95'
            }`}
            title="Trang đầu"
          >
            <MdKeyboardDoubleArrowLeft className="text-xl" />
          </button>

          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPreviousPage}
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              !hasPreviousPage
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-slate-600 hover:text-white hover:border-slate-600 hover:shadow-md active:scale-95'
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
                    className="px-3 py-2 text-gray-400 font-semibold"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`min-w-[42px] h-[42px] px-3 rounded-lg font-semibold transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-600/30 scale-105'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-slate-50 hover:border-slate-400 hover:shadow-md active:scale-95'
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
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              !hasNextPage
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-slate-600 hover:text-white hover:border-slate-600 hover:shadow-md active:scale-95'
            }`}
            title="Trang sau"
          >
            <MdKeyboardArrowRight className="text-xl" />
          </button>

          {/* Last page button */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage}
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              !hasNextPage
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-slate-600 hover:text-white hover:border-slate-600 hover:shadow-md active:scale-95'
            }`}
            title="Trang cuối"
          >
            <MdKeyboardDoubleArrowRight className="text-xl" />
          </button>
        </div>

        {/* Page info */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-slate-50 to-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-sm text-gray-600">
            Trang <span className="font-bold text-slate-700 text-base mx-1">{currentPage}</span> / <span className="font-semibold text-gray-700">{totalPages}</span>
          </span>
          {totalRecords > 0 && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-slate-700">{totalRecords}</span> bản ghi
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
