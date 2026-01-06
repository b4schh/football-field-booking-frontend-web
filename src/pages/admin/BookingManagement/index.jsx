import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdVisibility,
  MdCheckCircle,
} from "react-icons/md";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import DataTable from "../../../components/dashboard/DataTable";
import Pagination from "../../../components/common/Pagination";
import BookingStatusBadge from "../../../components/common/BookingStatusBadge";
import Modal from "../../../components/dashboard/Modal";
import bookingService from "../../../services/bookingService";
import { useToast } from "../../../store/toastStore";
import { getAllBookingStatuses, BOOKING_STATUS } from "../../../utils/bookingHelpers";
import { formatCurrency, formatDate, formatTimeSpan } from "../../../utils/formatHelpers";
import { getPaymentProofUrl } from "../../../utils/imageHelper";

/**
 * Admin Booking Management Page
 * Quản lý tất cả bookings trong hệ thống
 */
export default function AdminBookingManagement() {
  const navigate = useNavigate();
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: null,
    complexId: null,
    ownerId: null,
    customerId: null,
    fromDate: "",
    toDate: "",
    searchTerm: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Detail modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Force complete modal
  const [showForceCompleteModal, setShowForceCompleteModal] = useState(false);
  const [bookingToForce, setBookingToForce] = useState(null);
  const [processing, setProcessing] = useState(false);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = {
        pageIndex: currentPage,
        pageSize: pageSize,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === null || params[key] === "" || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await bookingService.getAllBookingsForAdmin(params);
      setBookings(response.data || []);
      setTotalRecords(response.totalRecords || 0);
      setTotalPages(response.totalPages || 0);
      setHasNextPage(response.hasNextPage || false);
      setHasPreviousPage(response.hasPreviousPage || false);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast.error(error.response?.data?.message || "Không thể tải danh sách booking");
    } finally {
      setLoading(false);
    }
  };

  // Load bookings when page/size changes
  useEffect(() => {
    loadBookings();
  }, [currentPage, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadBookings();
  };

  const handleResetFilters = () => {
    setFilters({
      status: null,
      complexId: null,
      ownerId: null,
      customerId: null,
      fromDate: "",
      toDate: "",
      searchTerm: "",
    });
    setCurrentPage(1);
    setTimeout(() => loadBookings(), 100);
  };

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleForceComplete = (booking) => {
    setBookingToForce(booking);
    setShowForceCompleteModal(true);
  };

  const confirmForceComplete = async () => {
    if (!bookingToForce) return;

    setProcessing(true);
    try {
      await bookingService.adminForceComplete(bookingToForce.id);
      toast.success("Đã force complete booking thành công");
      setShowForceCompleteModal(false);
      setBookingToForce(null);
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Force complete thất bại");
    } finally {
      setProcessing(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // DataTable columns
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => (
        <span className="font-semibold text-gray-900">#{row.id}</span>
      ),
    },
    {
      key: "bookingDate",
      label: "Ngày đặt sân",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {formatDate(row.bookingDate)}
          </div>
          <div className="text-sm text-gray-500">
            {formatTimeSpan(row.startTime)} - {formatTimeSpan(row.endTime)}
          </div>
        </div>
      ),
    },
    {
      key: "complex",
      label: "Cụm sân / Sân",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.complexName}</div>
          <div className="text-sm text-gray-500">{row.fieldName}</div>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Khách hàng",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.customerName}</div>
          <div className="text-sm text-gray-500">{row.customerPhone}</div>
        </div>
      ),
    },
    {
      key: "owner",
      label: "Chủ sân",
      render: (row) => (
        <span className="text-gray-900">{row.ownerName || "N/A"}</span>
      ),
    },
    {
      key: "totalAmount",
      label: "Tổng tiền",
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">
            {formatCurrency(row.totalAmount)}
          </div>
          <div className="text-xs text-gray-500">
            Cọc: {formatCurrency(row.depositAmount)}
          </div>
        </div>
      ),
    },
    {
      key: "bookingStatus",
      label: "Trạng thái",
      render: (row) => <BookingStatusBadge status={row.bookingStatus} />,
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetail(row);
            }}
            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
            title="Xem chi tiết"
          >
            <MdVisibility className="text-lg" />
          </button>
          {row.bookingStatus !== BOOKING_STATUS.COMPLETED && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleForceComplete(row);
              }}
              className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
              title="Force Complete (Testing)"
            >
              <MdCheckCircle className="text-lg" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading && bookings.length === 0) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Quản lý Booking"
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Quản lý Booking" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <MdFilterList />
              Bộ lọc
            </button>
            <button
              onClick={loadBookings}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MdRefresh />
              Làm mới
            </button>
          </div>
        }
      />

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bộ lọc tìm kiếm
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm
              </label>
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên khách, sân, cụm sân..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={filters.status ?? ""}
                onChange={(e) =>
                  handleFilterChange(
                    "status",
                    e.target.value === "" ? null : parseInt(e.target.value)
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                {getAllBookingStatuses().map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đặt lại
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Danh sách Booking ({totalRecords})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý tất cả bookings trong hệ thống
          </p>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            title="Không có booking nào"
            description="Chưa có booking nào trong hệ thống hoặc không tìm thấy kết quả phù hợp"
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={bookings}
              onRowClick={handleViewDetail}
              emptyMessage="Không có dữ liệu"
            />

            {totalRecords > pageSize && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalRecords={totalRecords}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <Modal
          title="Chi tiết Booking"
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Mã booking</label>
                <p className="font-semibold text-gray-900">#{selectedBooking.id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Trạng thái</label>
                <div className="mt-1">
                  <BookingStatusBadge status={selectedBooking.bookingStatus} />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin sân</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-500">Cụm sân</label>
                  <p className="text-gray-900">{selectedBooking.complexName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Sân</label>
                  <p className="text-gray-900">{selectedBooking.fieldName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Ngày đặt</label>
                  <p className="text-gray-900">{formatDate(selectedBooking.bookingDate)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Giờ chơi</label>
                  <p className="text-gray-900">
                    {formatTimeSpan(selectedBooking.startTime)} -{" "}
                    {formatTimeSpan(selectedBooking.endTime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-500">Tên khách hàng</label>
                  <p className="text-gray-900">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Số điện thoại</label>
                  <p className="text-gray-900">{selectedBooking.customerPhone}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin thanh toán</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-500">Tổng tiền</label>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(selectedBooking.totalAmount)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Tiền cọc</label>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(selectedBooking.depositAmount)}
                  </p>
                </div>
              </div>

              {selectedBooking.paymentProofUrl && (
                <div className="mt-4">
                  <label className="text-sm text-gray-500 block mb-2">
                    Ảnh chuyển khoản
                  </label>
                  <img
                    src={getPaymentProofUrl(selectedBooking.paymentProofUrl)}
                    alt="Payment proof"
                    className="w-full max-w-md h-auto rounded-lg border"
                  />
                </div>
              )}
            </div>

            {selectedBooking.note && (
              <div className="border-t pt-4">
                <label className="text-sm text-gray-500 block mb-2">Ghi chú</label>
                <p className="text-gray-900 whitespace-pre-line">{selectedBooking.note}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Force Complete Modal */}
      {showForceCompleteModal && bookingToForce && (
        <Modal
          title="Force Complete Booking"
          isOpen={showForceCompleteModal}
          onClose={() => setShowForceCompleteModal(false)}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Chức năng Testing:</strong> Force complete booking #{bookingToForce.id} 
                để test chức năng review. Booking sẽ chuyển sang trạng thái Completed.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-500">Booking ID</label>
                  <p className="font-semibold">#{bookingToForce.id}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Khách hàng</label>
                  <p className="font-semibold">{bookingToForce.customerName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Sân</label>
                  <p>{bookingToForce.fieldName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Ngày</label>
                  <p>{formatDate(bookingToForce.bookingDate)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setShowForceCompleteModal(false)}
                disabled={processing}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmForceComplete}
                disabled={processing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {processing ? "Đang xử lý..." : "Force Complete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
