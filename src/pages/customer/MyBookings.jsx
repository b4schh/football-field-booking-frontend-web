import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiClock, FiMapPin, FiFilter } from "react-icons/fi";
import useBookingStore from "../../store/bookingStore";

const BOOKING_STATUS = {
  0: { label: "Chờ upload bill", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  1: { label: "Chờ duyệt", color: "bg-blue-100 text-blue-800 border-blue-300" },
  2: { label: "Đã xác nhận", color: "bg-green-100 text-green-800 border-green-300" },
  3: { label: "Bị từ chối", color: "bg-red-100 text-red-800 border-red-300" },
  4: { label: "Đã hủy", color: "bg-gray-100 text-gray-800 border-gray-300" },
  5: { label: "Hoàn thành", color: "bg-purple-100 text-purple-800 border-purple-300" },
  6: { label: "Hết hạn", color: "bg-orange-100 text-orange-800 border-orange-300" },
  7: { label: "Không đến", color: "bg-red-100 text-red-800 border-red-300" }
};

function BookingCard({ booking, onClick }) {
  const status = BOOKING_STATUS[booking.bookingStatus] || BOOKING_STATUS[0];
  
  const formatDate = (dateString) => {
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const canUploadPayment = booking.bookingStatus === 0 && new Date(booking.holdExpiresAt) > new Date();
  const isExpired = booking.bookingStatus === 0 && new Date(booking.holdExpiresAt) <= new Date();

  return (
    <div 
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer"
      onClick={() => onClick(booking.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{booking.complexName}</h3>
          <p className="text-sm text-gray-600 mt-1">Mã booking: #{booking.id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <FiMapPin size={16} className="text-gray-400" />
          <span className="text-sm">{booking.fieldName}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <FiCalendar size={16} className="text-gray-400" />
          <span className="text-sm">{formatDate(booking.bookingDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <FiClock size={16} className="text-gray-400" />
          <span className="text-sm">
            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Tổng tiền</div>
          <div className="font-bold text-xl text-blue-600">{formatPrice(booking.totalAmount)}</div>
        </div>
        {canUploadPayment && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(booking.id);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Upload bill
          </button>
        )}
        {isExpired && (
          <span className="text-sm text-red-600 font-semibold">Đã hết hạn</span>
        )}
        {booking.bookingStatus === 1 && (
          <span className="text-sm text-blue-600 font-semibold">Chờ duyệt</span>
        )}
      </div>
    </div>
  );
}

export default function MyBookings() {
  const navigate = useNavigate();
  const { myBookings, fetchMyBookings, isLoading } = useBookingStore();
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const loadBookings = async () => {
    const params = statusFilter !== null ? { status: statusFilter } : {};
    await fetchMyBookings(params);
  };

  const handleCardClick = (bookingId) => {
    navigate(`/booking/${bookingId}/payment`);
  };

  const filteredBookings = myBookings || [];

  if (isLoading && filteredBookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6 md:px-8 lg:px-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Đơn đặt sân của tôi</h1>
          <p className="text-gray-600 mt-2">Quản lý tất cả các đơn đặt sân</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-gray-700">
              <FiFilter size={20} />
              <span className="font-semibold">Lọc theo trạng thái:</span>
            </div>
            <button
              onClick={() => setStatusFilter(null)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === null
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            {Object.entries(BOOKING_STATUS).map(([value, config]) => (
              <button
                key={value}
                onClick={() => setStatusFilter(parseInt(value))}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === parseInt(value)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Grid */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="text-gray-400 mb-4">
              <FiCalendar size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có đơn đặt sân nào</h3>
            <p className="text-gray-500 mb-6">Hãy tìm kiếm và đặt sân ngay!</p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Tìm sân
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
