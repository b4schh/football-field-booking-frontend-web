import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * ComplexesOverview Component - Tổng quan các cụm sân
 */
export default function ComplexesOverview({ complexes, loading }) {
  const navigate = useNavigate();

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
      className="bg-white rounded-xl p-6 border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Cụm sân của bạn</h3>
        <button
          onClick={() => navigate('/owner/complexes')}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          Quản lý →
        </button>
      </div>

      {/* Complexes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
        {complexes.length === 0 ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-gray-500 text-sm mb-3">Chưa có cụm sân nào</p>
            <button
              onClick={() => navigate('/owner/complexes/new')}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Tạo cụm sân
            </button>
          </div>
        ) : (
          complexes.map((complex, index) => (
            <motion.div
              key={complex.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/owner/complexes/${complex.id}`)}
              className="p-4 rounded-lg border border-gray-200 hover:border-gray-400 cursor-pointer transition-all"
            >
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 truncate">
                  {complex.name}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {complex.street}, {complex.ward}, {complex.province} 
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span>{complex.fieldCount || 0} sân</span>
                  <span>{complex.provinceName}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
