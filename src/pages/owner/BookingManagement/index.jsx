import { useState, useEffect } from "react";
import {
  MdVisibility,
  MdCheck,
  MdClose,
  MdCancel,
  MdDone,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import DataTable from "../../../components/dashboard/DataTable";
import Pagination from "../../../components/common/Pagination";
import Modal from "../../../components/dashboard/Modal";
import useBookingStore from "../../../store/bookingStore";
import { useToast } from "../../../store/toastStore";

export default function OwnerBookingManagement() {
  const toast = useToast();
  const navigate = useNavigate();
  const {
    fetchOwnerBookings,
    bookings,
    isLoading,
    fetchOwnerBookings: fetch,
    approveBooking,
    rejectBooking,
    cancelBooking,
    completeBooking,
    markNoShow,
  } = useBookingStore();

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [currentPage, pageSize]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      await fetchOwnerBookings({ pageIndex: currentPage, pageSize });
    } catch (err) {
      toast.error("Không thể tải danh sách booking");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (booking) => {
    setActionLoading(true);
    try {
      const res = await approveBooking(booking.id);
      if (res.success) {
        toast.success("Duyệt booking thành công");
        loadBookings();
      }
    } catch (err) {
      toast.error("Duyệt booking thất bại");
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
        loadBookings();
      }
    } catch (err) {
      toast.error("Từ chối booking thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (booking) => {
    setActionLoading(true);
    try {
      const res = await cancelBooking(booking.id);
      if (res.success) {
        toast.success("Hủy booking thành công");
        loadBookings();
      }
    } catch (err) {
      toast.error("Hủy booking thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (booking) => {
    setActionLoading(true);
    try {
      const res = await completeBooking(booking.id);
      if (res.success) {
        toast.success("Đánh dấu hoàn thành thành công");
        loadBookings();
      }
    } catch (err) {
      toast.error("Đánh dấu hoàn thành thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkNoShow = async (booking) => {
    setActionLoading(true);
    try {
      const res = await markNoShow(booking.id);
      if (res.success) {
        toast.success("Đánh dấu không đến thành công");
        loadBookings();
      }
    } catch (err) {
      toast.error("Đánh dấu không đến thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (r) => <span className="font-semibold">{r.id}</span>,
    },
    {
      key: "complexName",
      label: "Cụm sân",
      render: (r) => <span>{r.complexName}</span>,
    },
    {
      key: "fieldName",
      label: "Sân",
      render: (r) => <span>{r.fieldName}</span>,
    },
    {
      key: "customerName",
      label: "Khách hàng",
      render: (r) => <span>{r.customerName}</span>,
    },
    {
      key: "customerPhone",
      label: "SĐT",
      render: (r) => <span>{r.customerPhone}</span>,
    },
    {
      key: "bookingDate",
      label: "Ngày đặt",
      render: (r) => (
        <span>{new Date(r.bookingDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: "startTime",
      label: "Giờ",
      render: (r) => (
        <span>
          {r.startTime} - {r.endTime}
        </span>
      ),
    },
    {
      key: "totalAmount",
      label: "Tổng",
      render: (r) => (
        <span className="text-green-600 font-semibold">
          {r.totalAmount?.toLocaleString("vi-VN")} đ
        </span>
      ),
    },
    {
      key: "bookingStatusText",
      label: "Trạng thái",
      render: (r) => <span>{r.bookingStatusText}</span>,
    },

    {
      key: "actions",
      label: "Thao tác",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/owner/bookings/${r.id}`)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Xem chi tiết"
          >
            <MdVisibility />
          </button>
          {r.bookingStatusText === "Chờ duyệt" && (
            <>
              <button
                onClick={() => handleApprove(r)}
                disabled={actionLoading}
                className="p-2 bg-green-600 text-white rounded"
              >
                Duyệt
              </button>
              <button
                onClick={() => handleOpenReject(r)}
                disabled={actionLoading}
                className="p-2 bg-red-600 text-white rounded"
              >
                Từ chối
              </button>
            </>
          )}
          {r.bookingStatusText === "Đã xác nhận" && (
            <>
              <button
                onClick={() => handleComplete(r)}
                disabled={actionLoading}
                className="p-2 bg-blue-600 text-white rounded"
              >
                Hoàn thành
              </button>
              <button
                onClick={() => handleMarkNoShow(r)}
                disabled={actionLoading}
                className="p-2 bg-yellow-600 text-white rounded"
              >
                Không đến
              </button>
            </>
          )}
          {(r.bookingStatusText === "Chờ thanh toán cọc" ||
            r.bookingStatusText === "Chờ duyệt" ||
            r.bookingStatusText === "Đã xác nhận") && (
            <button
              onClick={() => handleCancel(r)}
              disabled={actionLoading}
              className="p-2 bg-gray-600 text-white rounded"
            >
              Hủy
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <PageHeader
        title="Quản lý đặt sân"
        breadcrumbs={[
          { label: "Trang chủ", path: "/owner" },
          { label: "Đặt sân" },
        ]}
      />

      {!bookings || bookings.length === 0 ? (
        <EmptyState
          title="Chưa có booking"
          description="Chưa có đơn đặt sân nào."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={bookings}
            searchable
            searchPlaceholder="Tìm kiếm theo tên khách/sân..."
          />
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={1}
              onPageChange={(p) => setCurrentPage(p)}
              hasNextPage={false}
              hasPreviousPage={false}
              pageSize={pageSize}
              onPageSizeChange={(s) => setPageSize(s)}
              totalRecords={bookings.length}
            />
          </div>
        </>
      )}

      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Từ chối booking"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Lý do từ chối:</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full border p-2 rounded"
            rows={4}
          ></textarea>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowRejectModal(false)}
              className="px-4 py-2 border rounded"
            >
              Hủy
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
