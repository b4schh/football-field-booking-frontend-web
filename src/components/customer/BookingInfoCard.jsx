import { FiCalendar, FiClock, FiMapPin, FiDollarSign } from "react-icons/fi";

export default function BookingInfoCard({ booking }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin đặt sân</h2>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <FiMapPin className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Cụm sân</div>
            <div className="font-semibold text-gray-900 text-lg">{booking.complexName}</div>
            {booking.complexAddress && (
              <div className="text-sm text-gray-600 mt-1">{booking.complexAddress}</div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <FiCalendar className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Ngày đặt sân</div>
            <div className="font-semibold text-gray-900 text-lg">{formatDateTime(booking.bookingDate)}</div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <FiClock className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Khung giờ</div>
            <div className="font-semibold text-gray-900 text-lg">
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Sân</span>
            <span className="font-semibold text-gray-900">{booking.fieldName}</span>
          </div>
          {booking.fieldType && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Loại sân</span>
              <span className="font-semibold text-gray-900">{booking.fieldType}</span>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <FiDollarSign size={20} />
            <span className="font-bold">Chi tiết thanh toán</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tổng tiền</span>
              <span className="font-semibold text-gray-900">{formatPrice(booking.totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tiền cọc (30%)</span>
              <span className="font-semibold text-orange-600">{formatPrice(booking.depositAmount)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-blue-200">
              <span className="text-sm text-gray-600">Còn lại</span>
              <span className="font-bold text-blue-600">{formatPrice(booking.totalAmount - booking.depositAmount)}</span>
            </div>
          </div>
        </div>

        {booking.note && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-sm text-gray-600 mb-1">Ghi chú của bạn</div>
            <div className="text-gray-900">{booking.note}</div>
          </div>
        )}
      </div>
    </div>
  );
}
