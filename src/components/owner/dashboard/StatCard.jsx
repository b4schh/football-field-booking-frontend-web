import { motion } from "framer-motion";

/**
 * StatCard Component - Thẻ thống kê tối giản
 */
export default function StatCard({ 
  title, 
  value, 
  subtitle
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all"
    >
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
