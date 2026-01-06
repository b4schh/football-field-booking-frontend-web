import { motion } from "framer-motion";
import { MdSchedule } from "react-icons/md";

/**
 * TopPeakHours Component - Top 5 khung giờ có nhiều booking nhất
 */
export default function TopPeakHours({ peakHours, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Format hour display
  const formatHour = (hour) => {
    return `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`;
  };

  // Get top 5 peak hours
  const topHours = [...peakHours]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate max count for percentage bar
  const maxCount = topHours.length > 0 ? topHours[0].count : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MdSchedule className="text-gray-700 text-xl" />
        <h3 className="text-lg font-semibold text-gray-900">Khung giờ hot</h3>
      </div>

      {/* Peak Hours List */}
      {topHours.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Chưa có dữ liệu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topHours.map((item, index) => {
            const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            
            return (
              <motion.div
                key={item.hour}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                {/* Background bar */}
                <div className="absolute inset-0 bg-gray-50 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="h-full bg-gray-200"
                  />
                </div>

                {/* Content */}
                <div className="relative flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatHour(item.hour)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.count} booking{item.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-700">
                      {percentage.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      {topHours.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Dữ liệu dựa trên tổng số booking trong mỗi khung giờ
          </p>
        </div>
      )}
    </motion.div>
  );
}
