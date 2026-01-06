import { useState, useEffect } from "react";
import { MdStar, MdVisibility, MdVisibilityOff, MdRateReview } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import DataTable from "../../../components/dashboard/DataTable";
import Pagination from "../../../components/common/Pagination";
import Modal from "../../../components/dashboard/Modal";
import useOwnerComplexes from "../../../hooks/useOwnerComplexes";
import reviewService from "../../../services/reviewService";
import { useToast } from "../../../store/toastStore";
import { formatRelativeDate } from "../../../utils/formatHelpers";

export default function ReviewManagement() {
  const toast = useToast();
  const { complexes, fetchComplexes } = useOwnerComplexes();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toggling, setToggling] = useState(false);

  // Filter states - split into temporary and applied
  const [filters, setFilters] = useState({
    complexId: "",
    rating: "",
    isVisible: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    complexId: "",
    rating: "",
    isVisible: "",
  });

  // Fetch reviews when page, pageSize, or appliedFilters change
  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, appliedFilters]);

  // Fetch complexes for filter dropdown (only once on mount)
  useEffect(() => {
    fetchComplexes({ pageIndex: 1, pageSize: 1000 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewService.getOwnerReviews(currentPage, pageSize, appliedFilters);
      setReviews(response.data || []);
      
      if (response.pageIndex !== undefined) {
        setPagination({
          currentPage: response.pageIndex,
          pageSize: response.pageSize,
          totalRecords: response.totalRecords,
          totalPages: response.totalPages,
          hasNextPage: response.hasNextPage,
          hasPreviousPage: response.hasPreviousPage,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Apply filters
  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      complexId: "",
      rating: "",
      isVisible: "",
    });
    setAppliedFilters({
      complexId: "",
      rating: "",
      isVisible: "",
    });
    setCurrentPage(1);
  };

  const handleToggleVisibility = async (reviewId, currentVisibility) => {
    setToggling(true);
    try {
      await reviewService.toggleReviewVisibility(reviewId, !currentVisibility);
      toast.success(currentVisibility ? "Đã ẩn đánh giá" : "Đã hiển thị đánh giá");
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật trạng thái thất bại");
    } finally {
      setToggling(false);
    }
  };

  const openDetailModal = (review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const hasActiveFilters =
    appliedFilters.complexId ||
    appliedFilters.rating ||
    appliedFilters.isVisible !== "";

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`text-sm ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Table columns
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span className="font-semibold text-gray-900">{row.id}</span>,
    },
    {
      key: "user",
      label: "Người đánh giá",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {row.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.user?.name || "Người dùng"}</div>
            <div className="text-sm text-gray-500">{formatRelativeDate(row.createdAt)}</div>
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      label: "Đánh giá",
      render: (row) => (
        <div className="flex flex-col gap-1">
          {renderStars(row.rating)}
          <span className="text-sm font-medium text-gray-700">{row.rating}/5</span>
        </div>
      ),
    },
    {
      key: "comment",
      label: "Nội dung",
      render: (row) => (
        <div className="max-w-md">
          <p className="text-gray-700 line-clamp-2">
            {row.comment || <span className="text-gray-400 italic">Không có bình luận</span>}
          </p>
          {row.images && row.images.length > 0 && (
            <span className="text-xs text-blue-600 mt-1 inline-block">
              {row.images.length} ảnh
            </span>
          )}
        </div>
      ),
    },
    {
      key: "helpful",
      label: "Hữu ích",
      render: (row) => (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          {row.helpful || 0} lượt
        </span>
      ),
    },
    // {
    //   key: "isVisible",
    //   label: "Trạng thái",
    //   render: (row) => (
    //     <div onClick={(e) => e.stopPropagation()}>
    //       <button
    //         onClick={() => handleToggleVisibility(row.id, row.isVisible)}
    //         disabled={toggling}
    //         className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
    //           row.isVisible
    //             ? "bg-green-100 text-green-700 hover:bg-green-200"
    //             : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    //         } disabled:opacity-50`}
    //       >
    //         {row.isVisible ? (
    //           <>
    //             <MdVisibility className="text-lg" />
    //             Hiển thị
    //           </>
    //         ) : (
    //           <>
    //             <MdVisibilityOff className="text-lg" />
    //             Đã ẩn
    //           </>
    //         )}
    //       </button>
    //     </div>
    //   ),
    // },
  ];

  if (loading && reviews.length === 0) {
    return (
      <div>
        <PageHeader title="Quản lý đánh giá" />
        <LoadingSkeleton type="table" rows={10} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Quản lý đánh giá" />

      {reviews.length === 0 && !hasActiveFilters ? (
        <div className="bg-white rounded-xl shadow-md">
          <EmptyState
            icon={MdRateReview}
            title="Chưa có đánh giá nào"
            message="Các đánh giá từ khách hàng sẽ xuất hiện ở đây"
          />
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Complex Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cụm sân
                </label>
                <select
                  value={filters.complexId}
                  onChange={(e) => setFilters((prev) => ({ ...prev, complexId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="">Tất cả cụm sân</option>
                  {complexes.map((complex) => (
                    <option key={complex.id} value={complex.id}>
                      {complex.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters((prev) => ({ ...prev, rating: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="">Tất cả đánh giá</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                </select>
              </div>

              {/* Visibility Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={filters.isVisible}
                  onChange={(e) => setFilters((prev) => ({ ...prev, isVisible: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="true">Đang hiển thị</option>
                  <option value="false">Đã ẩn</option>
                </select>
              </div>
            </div>

            {/* Search and Reset Buttons */}
            <div className="mt-4 flex justify-between items-center">
              {hasActiveFilters && (
                <p className="text-sm text-gray-600">
                  Hiển thị <span className="font-semibold">{pagination.totalRecords}</span> đánh giá
                </p>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  Tìm kiếm
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors font-medium border border-gray-300"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <DataTable
              columns={columns}
              data={reviews}
              onRowClick={openDetailModal}
            />

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalRecords={pagination.totalRecords}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
            />
          </div>
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReview && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReview(null);
          }}
          title="Chi tiết đánh giá"
          size="lg"
        >
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                {selectedReview.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{selectedReview.user?.name || "Người dùng"}</div>
                <div className="text-sm text-gray-500">{formatRelativeDate(selectedReview.createdAt)}</div>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá</label>
              <div className="flex items-center gap-3">
                {renderStars(selectedReview.rating)}
                <span className="font-semibold text-gray-900">{selectedReview.rating}/5</span>
              </div>
            </div>

            {/* Comment */}
            {selectedReview.comment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedReview.comment}</p>
              </div>
            )}

            {/* Images */}
            {selectedReview.images && selectedReview.images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh ({selectedReview.images.length})
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedReview.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">{selectedReview.helpful || 0}</span>
                <span className="text-sm">người thấy hữu ích</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedReview.isVisible
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}>
                {selectedReview.isVisible ? "Đang hiển thị" : "Đã ẩn"}
              </div>
            </div>

            {/* Actions */}
            {/* <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  handleToggleVisibility(selectedReview.id, selectedReview.isVisible);
                  setShowDetailModal(false);
                }}
                disabled={toggling}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium disabled:opacity-50"
              >
                {selectedReview.isVisible ? "Ẩn đánh giá" : "Hiển thị đánh giá"}
              </button>
            </div> */}
          </div>
        </Modal>
      )}
    </div>
  );
}
