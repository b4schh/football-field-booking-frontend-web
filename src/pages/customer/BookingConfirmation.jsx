import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiMapPin, FiDollarSign, FiAlertCircle } from "react-icons/fi";
import useBookingDraftStore from "../../store/bookingDraftStore";
import useBookingStore from "../../store/bookingStore";
import { useToast } from "../../store/toastStore";

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const toast = useToast();
  const { selectedSlot, selectedField, selectedDate, complexInfo, clearBookingDraft } = useBookingDraftStore();
  const { createBooking, isLoading } = useBookingStore();
  
  const [note, setNote] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  // Nếu không có draft, redirect về trang chủ (use useEffect to avoid render issue)
  useEffect(() => {
    // Don't redirect if we're in the middle of navigating to payment page
    if (!isNavigating && !selectedSlot && !selectedField && !selectedDate) {
      navigate("/", { replace: true });
    }
  }, [selectedSlot, selectedField, selectedDate, navigate, isNavigating]);

  // Early return if no draft data (but not during navigation)
  if (!selectedSlot || !selectedField || !selectedDate) {
    return null;
  }

  const depositAmount = selectedSlot.price * 0.3; // 30% deposit

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date) => {
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    return `${days[date.getDay()]}, ${date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}`;
  };

  const handleConfirmBooking = async () => {
    // Format date to YYYY-MM-DD (FIX: Dùng local timezone thay vì UTC)
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const bookingDate = `${year}-${month}-${day}`;
    
    console.group('🎯 BOOKING CONFIRMATION - Debug Info');
    console.log('📅 Selected Date Object:', selectedDate);
    console.log('📅 Selected Date toString():', selectedDate.toString());
    console.log('📅 Booking Date (YYYY-MM-DD):', bookingDate);
    console.log('⚽ Field ID:', selectedField.id);
    console.log('⏰ TimeSlot ID:', selectedSlot.id);
    console.log('📝 Note:', note || '(empty)');
    console.groupEnd();
    
    const bookingData = {
      fieldId: selectedField.id,
      timeSlotId: selectedSlot.id,
      bookingDate: bookingDate,
      note: note || undefined
    };
    
    console.log('📤 Final Payload:', JSON.stringify(bookingData, null, 2));

    const result = await createBooking(bookingData);
    
    console.log('📥 Create Booking Result:', result);
    console.log('📥 Result Data:', result?.data);
    console.log('📥 Full Result Structure:', JSON.stringify(result, null, 2));
    
    if (result && result.success) {
      // Store should return: { success: true, data: BookingDto }
      const bookingId = result.data?.id;
      
      console.log('🎫 Booking ID:', bookingId);
      console.log('🎫 Booking Data:', result.data);
      
      if (bookingId) {
        toast.success("Tạo booking thành công! Đang chuyển sang trang thanh toán...");
        // Set navigating flag to prevent useEffect redirect
        setIsNavigating(true);
        // Navigate immediately without clearing draft to avoid component re-render
        navigate(`/booking/${bookingId}/payment`, { replace: true });
        // Clear draft after a small delay (component will be unmounted by then)
        setTimeout(() => {
          clearBookingDraft();
        }, 200);
      } else {
        console.error('❌ Booking ID not found in response:', result);
        toast.error("Tạo booking thành công nhưng không nhận được mã booking. Vui lòng kiểm tra danh sách booking.");
        setIsNavigating(true);
        navigate("/my-bookings", { replace: true });
        setTimeout(() => {
          clearBookingDraft();
        }, 200);
      }
    } else {
      console.error('❌ Create booking failed:', result);
      toast.error(result?.error || "Không thể tạo booking. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6 md:px-8 lg:px-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Xác nhận đặt sân</h1>
          <p className="text-gray-600 mt-2">Vui lòng kiểm tra kỹ thông tin trước khi xác nhận</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complex Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin cụm sân</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{complexInfo?.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <FiMapPin size={16} />
                    <span>{complexInfo?.street}, {complexInfo?.ward}, {complexInfo?.province}</span>
                  </div>
                </div>
                {complexInfo?.phone && (
                  <div className="text-sm text-gray-600">
                    <strong>Hotline:</strong> {complexInfo.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Chi tiết đặt sân</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <FiCalendar className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Ngày đặt sân</div>
                    <div className="font-semibold text-gray-900 text-lg">{formatDate(selectedDate)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <FiClock className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Khung giờ</div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sân</span>
                    <span className="font-semibold text-gray-900">{selectedField.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Loại sân</span>
                    <span className="font-semibold text-gray-900">{selectedField.fieldType}</span>
                  </div>
                  {selectedField.surfaceType && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Mặt sân</span>
                      <span className="font-semibold text-gray-900">{selectedField.surfaceType}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ghi chú (không bắt buộc)</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú cho chủ sân (nếu có)..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="4"
                maxLength={255}
              />
              <div className="text-xs text-gray-500 mt-2">{note.length}/255 ký tự</div>
            </div>
          </div>

          {/* Sidebar - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tổng quan đơn đặt</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Giá sân</span>
                  <span className="font-semibold text-gray-900">{formatPrice(selectedSlot.price)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Tiền cọc (30%)</span>
                  <span className="font-semibold text-orange-600">{formatPrice(depositAmount)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Còn lại</span>
                  <span className="font-semibold text-gray-900">{formatPrice(selectedSlot.price - depositAmount)}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <FiDollarSign size={20} />
                  <span className="font-bold">Tổng thanh toán</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">{formatPrice(selectedSlot.price)}</div>
                <div className="text-sm text-blue-700 mt-1">Cọc trước: {formatPrice(depositAmount)}</div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                <div className="flex items-start gap-2">
                  <FiAlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Bạn có 5 phút để upload bill chuyển khoản</li>
                      <li>Sau khi upload, chủ sân sẽ duyệt trong 24h</li>
                      <li>Thanh toán phần còn lại tại sân</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleConfirmBooking}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg disabled:cursor-not-allowed"
                >
                  {isLoading ? "Đang xử lý..." : "Xác nhận đặt sân"}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
