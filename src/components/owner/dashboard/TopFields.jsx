import { motion } from "framer-motion";

/**
 * TopFields Component - Top sân được đặt nhiều nhất
 */
export default function TopFields({ fields, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...fields.map(f => f.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border border-gray-200"
    >
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 sân</h3>

      {/* Fields List */}
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Chưa có dữ liệu</p>
          </div>
        ) : (
          fields.map((field, index) => {
            const percentage = (field.count / maxCount) * 100;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{field.name}</span>
                  <span className="font-semibold text-gray-900">
                    {field.count}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.15 }}
                    className="h-full bg-gray-900 rounded-full"
                  />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
