import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack, MdCheck, MdClose, MdCancel } from "react-icons/md";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import Modal from "../../../components/dashboard/Modal";
import bookingService from "../../../services/bookingService";
import { getPaymentProofUrl } from "../../../utils/imageHelper";
import useBookingStore from "../../../store/bookingStore";
import { useToast } from "../../../store/toastStore";

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { fetchOwnerBookings, approveBooking, rejectBooking, cancelBooking, completeBooking, markNoShow } = useBookingStore();

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
      // ApiResponse wrapper -> extract data
      const data = res?.data || res;
      // Normalize paymentProofUrl to absolute URL using helper
      if (data && data.paymentProofUrl) {
        data.paymentProofFullUrl = getPaymentProofUrl(data.paymentProofUrl);
      }
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
    setActionLoading(true);
    try {
      const res = await approveBooking(booking.id);
      if (res.success) {
        toast.success("Duyệt booking thành công");
        await fetchOwnerBookings({ pageIndex: 1, pageSize: 10 });
        loadBooking();
      }
    } catch (err) {
      toast.error("Duyệt booking thất bại");
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
        await fetchOwnerBookings({ pageIndex: 1, pageSize: 10 });
        loadBooking();
      }
    } catch (err) {
      toast.error("Từ chối booking thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    setActionLoading(true);
    try {
      const res = await cancelBooking(booking.id);
      if (res.success) {
        toast.success("Hủy booking thành công");
        await fetchOwnerBookings({ pageIndex: 1, pageSize: 10 });
        navigate(-1);
      }
    } catch (err) {
      toast.error("Hủy booking thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!booking) return;
    setActionLoading(true);
    try {
      const res = await completeBooking(booking.id);
      if (res.success) {
        toast.success("Đánh dấu hoàn thành thành công");
        await fetchOwnerBookings({ pageIndex: 1, pageSize: 10 });
        loadBooking();
      }
    } catch (err) {
      toast.error("Đánh dấu hoàn thành thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkNoShow = async () => {
    if (!booking) return;
    setActionLoading(true);
    try {
      const res = await markNoShow(booking.id);
      if (res.success) {
        toast.success("Đánh dấu không đến thành công");
        await fetchOwnerBookings({ pageIndex: 1, pageSize: 10 });
        loadBooking();
      }
    } catch (err) {
      toast.error("Đánh dấu không đến thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const statusClass = (text) => {
    if (!text) return "bg-gray-50 text-gray-700";
    const t = text.toLowerCase();
    if (t.includes("chờ")) return "bg-amber-50 text-amber-700";
    if (t.includes("xác nhận") || t.includes("confirmed") || t.includes("đã xác nhận")) return "bg-green-50 text-green-700";
    if (t.includes("từ chối") || t.includes("rejected")) return "bg-red-50 text-red-700";
    if (t.includes("hủy") || t.includes("cancel")) return "bg-gray-50 text-gray-700";
    if (t.includes("hoàn thành") || t.includes("completed")) return "bg-blue-50 text-blue-700";
    return "bg-gray-50 text-gray-700";
  };

  if (loading) return <LoadingSkeleton />;
  if (!booking) return null;

  return (
    <div>
      <PageHeader
        title={`Booking #${booking.id}`}
        breadcrumbs={[{ label: "Trang chủ", path: "/owner" }, { label: "Đặt sân", path: "/owner/bookings" }, { label: `#${booking.id}` }]}
        actions={
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Quay lại</button>
            {booking.bookingStatusText === "Chờ duyệt" && (
              <>
                <button onClick={handleApprove} disabled={actionLoading} className="px-4 py-2 bg-green-600 text-white rounded">Duyệt</button>
                <button onClick={openReject} disabled={actionLoading} className="px-4 py-2 bg-red-600 text-white rounded">Từ chối</button>
              </>
            )}
            {booking.bookingStatusText === "Đã xác nhận" && (
              <>
                <button onClick={handleComplete} disabled={actionLoading} className="px-4 py-2 bg-blue-600 text-white rounded">Hoàn thành</button>
                <button onClick={handleMarkNoShow} disabled={actionLoading} className="px-4 py-2 bg-yellow-600 text-white rounded">Không đến</button>
              </>
            )}
            {(booking.bookingStatusText === "Chờ thanh toán cọc" || booking.bookingStatusText === "Chờ duyệt" || booking.bookingStatusText === "Đã xác nhận") && (
              <button onClick={handleCancel} disabled={actionLoading} className="px-4 py-2 bg-gray-600 text-white rounded">Hủy</button>
            )}
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="md:flex md:gap-6 items-start">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{booking.fieldName}</h3>
                <p className="text-sm text-gray-500">{booking.complexName}</p>
              </div>
              <div className="text-right">
                <span className={`${statusClass(booking.bookingStatusText)} inline-flex items-center px-3 py-1 rounded-full text-sm font-medium`}>{booking.bookingStatusText}</span>
                <p className="text-sm text-gray-500 mt-1">{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : ''} • {booking.startTime} - {booking.endTime}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Khách</p>
                <p className="font-semibold">{booking.customerName}</p>
                <a href={`tel:${booking.customerPhone}`} className="text-sm text-blue-600 mt-1 inline-block">{booking.customerPhone}</a>
              </div>

              <div>
                <p className="text-sm text-gray-500">Số tiền</p>
                <p className="font-semibold text-green-600">{booking.totalAmount?.toLocaleString("vi-VN")} đ</p>
                <p className="text-sm text-gray-500">Cọc: {booking.depositAmount?.toLocaleString("vi-VN")} đ</p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500">Ghi chú</p>
                <p className="text-gray-700">{booking.note || "-"}</p>
              </div>
            </div>
          </div>

          <aside className="w-full md:w-72 mt-6 md:mt-0 space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500">Mã đơn</p>
              <p className="font-semibold">#{booking.id}</p>
              <div className="mt-3 text-sm text-gray-600">
                <p>Hold expires: {booking.holdExpiresAt ? new Date(booking.holdExpiresAt).toLocaleString() : '-'}</p>
                <p className="mt-1">Created: {new Date(booking.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {booking.paymentProofFullUrl && (
              <div className="rounded overflow-hidden">
                <p className="text-sm text-gray-500 mb-2">Ảnh bill</p>
                <a href={booking.paymentProofFullUrl} target="_blank" rel="noreferrer">
                  <img src={booking.paymentProofFullUrl} alt="payment proof" className="w-full h-40 object-cover rounded" />
                </a>
              </div>
            )}
          </aside>
        </div>
      </div>

      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Từ chối booking">
        <div className="space-y-4">
          <p className="text-gray-600">Lý do từ chối:</p>
          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full border p-2 rounded" rows={4}></textarea>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 border rounded">Hủy</button>
            <button onClick={handleReject} disabled={actionLoading || !rejectReason.trim()} className="px-4 py-2 bg-red-600 text-white rounded">Xác nhận</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
