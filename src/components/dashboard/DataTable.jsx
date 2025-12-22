import { 
  MdKeyboardArrowLeft, 
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight 
} from "react-icons/md";
import { HiSearch } from "react-icons/hi";
import { MdSort } from "react-icons/md";
import { useState } from "react";

export default function DataTable({ 
  columns, 
  data, 
  onRowClick,
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
  searchable = false,
  onSearch,
  searchPlaceholder = "Tìm kiếm...",
  actions
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState("");

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Get page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Search and Actions Bar */}
      {(searchable || actions) && (
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
          {/* Search */}
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="hover:text-slate-600 transition-colors"
                      >
                        <MdSort className="text-base" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data && data.length > 0 ? (
              data.map((row, index) => (
                <tr
                  key={row.id || index}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 text-sm text-gray-900">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Trang {currentPage} / {totalPages}
          </div>

          <div className="flex items-center gap-2">
            {/* First page */}
            <button
              onClick={() => onPageChange(1)}
              disabled={!hasPreviousPage}
              className={`p-2 rounded-lg border transition-all ${
                !hasPreviousPage
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MdKeyboardDoubleArrowLeft className="text-xl" />
            </button>

            {/* Previous */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPreviousPage}
              className={`p-2 rounded-lg border transition-all ${
                !hasPreviousPage
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MdKeyboardArrowLeft className="text-xl" />
            </button>

            {/* Page numbers */}
            {pageNumbers.map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
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
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className={`p-2 rounded-lg border transition-all ${
                !hasNextPage
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MdKeyboardArrowRight className="text-xl" />
            </button>

            {/* Last page */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={!hasNextPage}
              className={`p-2 rounded-lg border transition-all ${
                !hasNextPage
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MdKeyboardDoubleArrowRight className="text-xl" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
