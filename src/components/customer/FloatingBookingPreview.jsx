import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiChevronDown, FiChevronUp, FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import useBookingDraftStore from "../../store/bookingDraftStore";
import ProtectedAction from "./ProtectedAction";

export default function FloatingBookingPreview() {
  const navigate = useNavigate();
  const { selectedSlot, selectedField, selectedDate, complexInfo, clearBookingDraft } = useBookingDraftStore();
  
  const [isMinimized, setIsMinimized] = useState(false);

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

  // Không hiển thị nếu không có draft
  if (!selectedSlot || !selectedField || !selectedDate) {
    return null;
  }

  const handleProceedToBooking = () => {
    navigate("/booking/confirm");
  };

  return (
    <div
      className="fixed bottom-0 right-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-[380px] transition-all"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl"
      >
        <h3 className="font-bold text-lg">Thông tin đặt sân</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 p-1.5 rounded-lg transition"
          >
            {isMinimized ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
          </button>
          <button
            onClick={clearBookingDraft}
            className="hover:bg-white/20 p-1.5 rounded-lg transition"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4 space-y-4">
          {/* Complex Info */}
          <div className="pb-3 border-b border-gray-200">
            <h4 className="font-bold text-lg text-gray-900">{complexInfo?.name}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <FiMapPin size={14} />
              <span>{complexInfo?.street}, {complexInfo?.ward}</span>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <FiCalendar className="text-blue-600" size={18} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Ngày đặt</div>
                <div className="font-semibold text-gray-900">{formatDate(selectedDate)}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <FiClock className="text-blue-600" size={18} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Khung giờ</div>
                <div className="font-semibold text-gray-900">
                  {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sân</span>
                <span className="font-semibold text-gray-900">{selectedField.name}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Loại sân</span>
                <span className="font-semibold text-gray-900">{selectedField.fieldType}</span>
              </div>
              {selectedField.surfaceType && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Mặt sân</span>
                  <span className="font-semibold text-gray-900">{selectedField.surfaceType}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Giá sân</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(selectedSlot.price)}
              </span>
            </div>

            {/* Action Button */}
            <ProtectedAction
              onClick={handleProceedToBooking}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
            >
              Đặt sân ngay
            </ProtectedAction>
          </div>
        </div>
      )}
    </div>
  );
}
