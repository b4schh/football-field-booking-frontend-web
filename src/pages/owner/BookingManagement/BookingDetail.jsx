import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdCheckCircle,
  MdCancel,
  MdDone,
  MdWarning,
  MdImage,
} from "react-icons/md";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import Modal from "../../../components/dashboard/Modal";
import BookingStatusBadge from "../../../components/owner/BookingStatusBadge";
import useBookingStore from "../../../store/bookingStore";
import { useToast } from "../../../store/toastStore";
import { bookingService } from "../../../services/bookingService";
import { getPaymentProofUrl } from "../../../utils/imageHelper";

/**
 * Booking Detail Page for Owner
 * Hiển thị chi tiết booking và cho phép thực hiện các hành động theo booking flow
 */
export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    approveBooking,
    rejectBooking,
    cancelBooking,
    completeBooking,
    markNoShow,
  } = useBookingStore();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getBookingById(id);
      const data = res?.data || res;
      setBooking(data);
    } catch (err) {
      toast.error("Không thể tải chi tiết booking");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!booking) return;
    if (!window.confirm("Xác nhận duyệt booking này?")) return;
    setActionLoading(true);
    try {
      const res = await approveBooking(booking.id);
      if (res.success) {
        toast.success("Duyệt booking thành công");
        loadBooking();
      }
    } catch (err) {
      toast.error(err.message || "Duyệt booking thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const openReject = () => setShowRejectModal(true);

  const handleReject = async () => {
    if (!booking) return;
    setActionLoading(true);
    try {
      const res = await rejectBooking(booking.id, rejectReason);
      if (res.success) {
        toast.success("Từ chối booking thành công");
        setShowRejectModal(false);
        setRejectReason("");
        loadBooking();
      }
    } catch (err) {
      toast.error(err.message || "Từ chối booking thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    if (!window.confirm("Xác nhận hủy booking này?")) return;
    setActionLoading(true);
    try {
      const res = await cancelBooking(booking.id);
      if (res.success) {
        toast.success("Hủy booking thành công");
        loadBooking();
      }
    } catch (err) {
      toast.error(err.message || "Hủy booking thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!booking) return;
    if (!window.confirm("Xác nhận đánh dấu hoàn thành?")) return;
    setActionLoading(true);
    try {
      const res = await completeBooking(booking.id);
      if (res.success) {
        toast.success("Đánh dấu hoàn thành thành công");
        loadBooking();
      }
    } catch (err) {
      toast.error(err.message || "Đánh dấu hoàn thành thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkNoShow = async () => {
    if (!booking) return;
    if (!window.confirm("Xác nhận khách không đến?")) return;
    setActionLoading(true);
    try {
      const res = await markNoShow(booking.id);
      if (res.success) {
        toast.success("Đánh dấu không đến thành công");
        loadBooking();
      }
    } catch (err) {
      toast.error(err.message || "Đánh dấu không đến thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  // Helper: Check if booking date has passed (after end time)
  const hasMatchPassed = () => {
    if (!booking) return false;
    const now = new Date();
    const bookingDateTime = new Date(booking.bookingDate);
    
    // Parse end time (format: "HH:mm:ss")
    const [hours, minutes] = booking.endTime.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);
    
    return now >= bookingDateTime;
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Chi tiết booking"
          breadcrumbs={[
            { label: "Đặt sân", path: "/owner/bookings" },
            { label: "Chi tiết" },
          ]}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  if (!booking) return null;

  // Action buttons based on status
  const renderActionButtons = () => {
    const buttons = [];

    // Chờ duyệt (WaitingForApproval = 1)
    if (booking.bookingStatus === 1) {
      buttons.push(
        <button
          key="approve"
          onClick={handleApprove}
          disabled={actionLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Duyệt
        </button>
      );
      buttons.push(
        <button
          key="reject"
          onClick={openReject}
          disabled={actionLoading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Từ chối
        </button>
      );
    }

    // Đã xác nhận (Confirmed = 2)
    if (booking.bookingStatus === 2) {
      const matchPassed = hasMatchPassed();
      const disabledReason = !matchPassed
        ? "Chỉ có thể đánh dấu sau giờ thi đấu kết thúc"
        : "";

      buttons.push(
        <div key="complete" className="relative group">
          <button
            onClick={handleComplete}
            disabled={actionLoading || !matchPassed}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={disabledReason}
          >
            Hoàn thành
          </button>
          {!matchPassed && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {disabledReason}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      );
      buttons.push(
        <div key="no-show" className="relative group">
          <button
            onClick={handleMarkNoShow}
            disabled={actionLoading || !matchPassed}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={disabledReason}
          >
            Không đến
          </button>
          {!matchPassed && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {disabledReason}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      );
    }

    // Có thể hủy (Pending=0, WaitingForApproval=1, Confirmed=2)
    if (
      booking.bookingStatus === 0 ||
      booking.bookingStatus === 1 ||
      booking.bookingStatus === 2
    ) {
      buttons.push(
        <button
          key="cancel"
          onClick={handleCancel}
          disabled={actionLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Hủy booking
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Booking #${booking.id}`}
        breadcrumbs={[
          { label: "Đặt sân", path: "/owner/bookings" },
          { label: `#${booking.id}` },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MdArrowBack />
              Quay lại
            </button>
            {renderActionButtons()}
          </div>
        }
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6">
        {/* Left Column - Complete Booking Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {booking.complexName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {booking.fieldName}
                </p>
              </div>
              <BookingStatusBadge status={booking.bookingStatus} />
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Ngày đặt
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(booking.bookingDate).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>

              {/* Customer Info */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Khách hàng
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {booking.customerName}
                </p>
                <a
                  href={`tel:${booking.customerPhone}`}
                  className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                >
                  {booking.customerPhone}
                </a>
              </div>

              {/* Amount Info */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Tổng tiền
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {booking.totalAmount?.toLocaleString("vi-VN")} đ
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Tiền cọc
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {booking.depositAmount?.toLocaleString("vi-VN")} đ
                </p>
              </div>

              {/* Note */}
              {booking.note && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Ghi chú
                  </p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {booking.note}
                  </p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Metadata Timeline */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin đơn
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã booking:</span>
                  <span className="font-semibold text-gray-900">
                    #{booking.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạo lúc:</span>
                  <span className="text-gray-700">
                    {new Date(booking.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                {booking.holdExpiresAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hết hạn giữ chỗ:</span>
                    <span className="text-gray-700">
                      {new Date(booking.holdExpiresAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                )}
                {booking.approvedBy && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Người duyệt:</span>
                      <span className="text-gray-700">
                        {booking.approvedByName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duyệt lúc:</span>
                      <span className="text-gray-700">
                        {new Date(booking.approvedAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </>
                )}
                {booking.cancelledBy && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Người hủy:</span>
                      <span className="text-gray-700">
                        {booking.cancelledByName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hủy lúc:</span>
                      <span className="text-gray-700">
                        {new Date(booking.cancelledAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Cập nhật lần cuối:</span>
                  <span className="text-gray-700">
                    {new Date(booking.updatedAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Flow Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">
              Quy trình đặt sân
            </h4>
            <ol className="text-xs text-blue-800 space-y-2 list-decimal list-inside">
              <li>Khách tạo booking (Chờ thanh toán cọc)</li>
              <li>Khách upload bill (Chờ duyệt)</li>
              <li>Chủ sân duyệt/từ chối (Đã xác nhận)</li>
              <li>Sau trận: Hoàn thành hoặc Không đến</li>
            </ol>
          </div>
        </div>

        {/* Right Column - Payment Proof */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Ảnh bill thanh toán
          </h4>
          {booking.paymentProofUrl ? (
            <>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                {(() => {
                  const paymentUrl = getPaymentProofUrl(
                    booking.paymentProofUrl
                  );
                  return (
                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={paymentUrl}
                        alt="Payment proof"
                        className="w-full h-auto object-contain bg-gray-50"
                      />
                    </a>
                  );
                })()}
              </div>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Nhấn vào ảnh để xem ở kích thước đầy đủ
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <MdImage className="text-6xl mb-3" />
              <p className="text-sm">Chưa có bill thanh toán</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason("");
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
