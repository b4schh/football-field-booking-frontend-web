import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import DataTable from "../../../components/dashboard/DataTable";
import Pagination from "../../../components/common/Pagination";
import Modal from "../../../components/dashboard/Modal";
import BookingStatusBadge from "../../../components/owner/BookingStatusBadge";
import useBookingStore from "../../../store/bookingStore";
import { useToast } from "../../../store/toastStore";

/**
 * Owner Booking Management Page
 * Quản lý đặt sân cho Owner theo đúng nghiệp vụ booking flow
 */
export default function OwnerBookingManagement() {
  const toast = useToast();
  const navigate = useNavigate();
  const {
    ownerBookings,
    ownerBookingsPagination,
    isLoading,
    fetchOwnerBookings,
    approveBooking,
    rejectBooking,
    cancelBooking,
    completeBooking,
    markNoShow,
  } = useBookingStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load bookings on mount và khi page, pageSize hoặc statusFilter thay đổi
  useEffect(() => {
    loadBookings();
  }, [currentPage, pageSize, statusFilter]);

  const loadBookings = async () => {
    try {
      await fetchOwnerBookings({
        pageIndex: currentPage,
        pageSize: pageSize,
        status: statusFilter !== "all" ? parseInt(statusFilter) : null,
      });
    } catch (err) {
      toast.error("Không thể tải danh sách booking");
    }
  };

  const handleApprove = async (booking) => {
    if (!window.confirm("Xác nhận duyệt booking này?")) return;
    setActionLoading(true);
    try {
      const res = await approveBooking(booking.id);
      if (res.success) {
        toast.success("Duyệt booking thành công");
      }
    } catch (err) {
      toast.error(err.message || "Duyệt booking thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (booking) => {
    setSelectedBooking(booking);
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      const res = await rejectBooking(selectedBooking.id, rejectReason);
      if (res.success) {
        toast.success("Từ chối booking thành công");
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedBooking(null);
      }
    } catch (err) {
      toast.error(err.message || "Từ chối booking thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (booking) => {
    if (!window.confirm("Xác nhận hủy booking này?")) return;
    setActionLoading(true);
    try {
      const res = await cancelBooking(booking.id);
      if (res.success) {
        toast.success("Hủy booking thành công");
      }
    } catch (err) {
      toast.error(err.message || "Hủy booking thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (booking) => {
    if (!window.confirm("Xác nhận đánh dấu hoàn thành?")) return;
    setActionLoading(true);
    try {
      const res = await completeBooking(booking.id);
      if (res.success) {
        toast.success("Đánh dấu hoàn thành thành công");
      }
    } catch (err) {
      toast.error(err.message || "Đánh dấu hoàn thành thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkNoShow = async (booking) => {
    if (!window.confirm("Xác nhận khách không đến?")) return;
    setActionLoading(true);
    try {
      const res = await markNoShow(booking.id);
      if (res.success) {
        toast.success("Đánh dấu không đến thành công");
      }
    } catch (err) {
      toast.error(err.message || "Đánh dấu không đến thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleRowClick = (booking) => {
    navigate(`/owner/bookings/${booking.id}`);
  };

  // Helper: Check if booking date has passed (after end time)
  const hasMatchPassed = (booking) => {
    if (!booking) return false;
    const now = new Date();
    const bookingDateTime = new Date(booking.bookingDate);
    
    // Parse end time (format: "HH:mm:ss")
    const [hours, minutes] = booking.endTime.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);
    
    return now >= bookingDateTime;
  };

  // Áp dụng search filter trên client side (server đã xử lý status filter)
  const filteredBookings = ownerBookings.filter((booking) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerPhone?.includes(searchTerm) ||
      booking.fieldName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.complexName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id?.toString().includes(searchTerm);

    return matchesSearch;
  });

  // Table columns
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => (
        <span className="font-semibold text-gray-900">#{row.id}</span>
      ),
    },
    {
      key: "complexName",
      label: "Cụm sân",
      render: (row) => (
        <span className="font-medium text-gray-900">{row.complexName}</span>
      ),
    },
    {
      key: "fieldName",
      label: "Sân",
      render: (row) => <span className="text-gray-600">{row.fieldName}</span>,
    },
    {
      key: "customerInfo",
      label: "Khách hàng",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.customerName}</span>
          <span className="text-xs text-gray-500">{row.customerPhone}</span>
        </div>
      ),
    },
    {
      key: "bookingDate",
      label: "Ngày đặt",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {new Date(row.bookingDate).toLocaleDateString("vi-VN")}
          </span>
          <span className="text-xs text-gray-500">
            {row.startTime} - {row.endTime}
          </span>
        </div>
      ),
    },
    {
      key: "amounts",
      label: "Số tiền",
      render: (row) => (
        <div className="flex flex-col ">
          <span className="font-semibold text-green-600">
            {row.totalAmount?.toLocaleString("vi-VN")} đ
          </span>
          <span className="text-xs text-gray-500">
            Cọc: {row.depositAmount?.toLocaleString("vi-VN")} đ
          </span>
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
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chờ duyệt (WaitingForApproval = 1) */}
          {row.bookingStatus === 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(row);
                }}
                disabled={actionLoading}
                className="flex items-center gap-1 px-3 py-2.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Duyệt
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenReject(row);
                }}
                disabled={actionLoading}
                className="flex items-center gap-1 px-3 py-2.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Từ chối
              </button>
            </>
          )}

          {/* Đã xác nhận (Confirmed = 2) */}
          {row.bookingStatus === 2 && (
            <>
              <div className="relative group">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!hasMatchPassed(row)) {
                      toast.warning("Chỉ có thể đánh dấu sau giờ thi đấu kết thúc");
                      return;
                    }
                    handleComplete(row);
                  }}
                  disabled={actionLoading || !hasMatchPassed(row)}
                  className="flex items-center gap-1 px-3 py-2.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!hasMatchPassed(row) ? "Chỉ có thể đánh dấu sau giờ thi đấu" : ""}
                >
                  Hoàn thành
                </button>
              </div>
              <div className="relative group">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!hasMatchPassed(row)) {
                      toast.warning("Chỉ có thể đánh dấu sau giờ thi đấu kết thúc");
                      return;
                    }
                    handleMarkNoShow(row);
                  }}
                  disabled={actionLoading || !hasMatchPassed(row)}
                  className="flex items-center gap-1 px-3 py-2.5 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!hasMatchPassed(row) ? "Chỉ có thể đánh dấu sau giờ thi đấu" : ""}
                >
                  Không đến
                </button>
              </div>
            </>
          )}

          {/* Có thể hủy (Pending=0, WaitingForApproval=1, Confirmed=2) */}
          {(row.bookingStatus === 0 ||
            row.bookingStatus === 1 ||
            row.bookingStatus === 2) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCancel(row);
              }}
              disabled={actionLoading}
              className="flex items-center gap-1 px-3 py-2.5 text-xs font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Quản lý đặt sân"
        />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý đặt sân"
      />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, SĐT, sân..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="0">Chờ thanh toán cọc</option>
              <option value="1">Chờ duyệt</option>
              <option value="2">Đã xác nhận</option>
              <option value="3">Đã từ chối</option>
              <option value="4">Đã hủy</option>
              <option value="5">Hoàn thành</option>
              <option value="6">Hết hạn</option>
              <option value="7">Không đến</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {!ownerBookings || ownerBookings.length === 0 ? (
        <EmptyState
          title="Chưa có booking"
          description="Chưa có đơn đặt sân nào từ khách hàng."
        />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="Không tìm thấy kết quả"
          description="Không có booking nào khớp với bộ lọc của bạn."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={filteredBookings}
            onRowClick={handleRowClick}
          />
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <Pagination
              currentPage={ownerBookingsPagination.pageIndex}
              totalPages={ownerBookingsPagination.totalPages}
              onPageChange={handlePageChange}
              hasNextPage={ownerBookingsPagination.hasNextPage}
              hasPreviousPage={ownerBookingsPagination.hasPreviousPage}
              pageSize={ownerBookingsPagination.pageSize}
              onPageSizeChange={handlePageSizeChange}
              totalRecords={ownerBookingsPagination.totalRecords}
            />
          </div>
        </>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason("");
          setSelectedBooking(null);
        }}
        title="Từ chối booking"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối booking..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason("");
                setSelectedBooking(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
