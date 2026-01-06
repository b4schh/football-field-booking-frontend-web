import { motion } from "framer-motion";
import { FaRegCalendarTimes } from "react-icons/fa";

/**
 * UpcomingBookings Component - Booking sắp diễn ra
 */
export default function UpcomingBookings({ bookings, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded"></div>
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
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Sắp diễn ra</h3>
        <p className="text-sm text-gray-500 mt-1">Trong 3 giờ tới</p>
      </div>

      {/* Bookings List */}
      <div className="space-y-2 flex-1 overflow-auto">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FaRegCalendarTimes className="text-7xl mb-3 text-gray-400" />
            <p className="text-sm">Không có booking sắp tới</p>
          </div>
        ) : (
          bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-gray-50 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{booking.fieldName}</h4>
                <span className="px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded">
                  {booking.startTime}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="truncate">{booking.complexName}</p>
                <p className="text-gray-900">{booking.customerName}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
