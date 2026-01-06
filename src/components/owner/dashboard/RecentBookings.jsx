import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MdEventNote } from "react-icons/md";
import BookingStatusBadge from "../BookingStatusBadge";

/**
 * RecentBookings Component - Danh sách booking gần đây
 */
export default function RecentBookings({ bookings, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border border-gray-200 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Booking gần đây</h3>
        <button
          onClick={() => navigate('/owner/bookings')}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          Xem tất cả →
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-2 flex-1 overflow-auto">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MdEventNote className="text-8xl mb-3 text-gray-400" />
            <p className="text-sm">Chưa có booking nào</p>
          </div>
        ) : (
          bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/owner/bookings/${booking.id}`)}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-400 cursor-pointer transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">
                    {booking.complexName} - {booking.fieldName}
                  </h4>
                  <BookingStatusBadge status={booking.bookingStatus} />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{new Date(booking.bookingDate).toLocaleDateString('vi-VN')}</span>
                  <span>{booking.startTime} - {booking.endTime}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {booking.totalAmount?.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-xs text-gray-500">{booking.customerName}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
