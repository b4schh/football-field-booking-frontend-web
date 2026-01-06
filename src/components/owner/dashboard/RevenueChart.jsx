import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * RevenueChart Component - Biểu đồ doanh thu với Recharts
 */
export default function RevenueChart({
  data,
  loading,
  onPeriodChange,
  weekCount,
  onWeekCountChange,
  currentPeriod,
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(
    currentPeriod || "daily"
  );

  // Sync local state với prop khi currentPeriod thay đổi
  useEffect(() => {
    if (currentPeriod && currentPeriod !== selectedPeriod) {
      setSelectedPeriod(currentPeriod);
    }
  }, [currentPeriod, selectedPeriod]);

  const periods = [
    { value: "daily", label: "Ngày" },
    { value: "weekly", label: "Tuần" },
    { value: "monthly", label: "Tháng" },
    { value: "quarterly", label: "Quý" },
    { value: "yearly", label: "Năm" },
  ];

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (onPeriodChange) {
      onPeriodChange(period);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-80 bg-gray-100 rounded"></div>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map((item) => {
    let label;
    let fullLabel;

    // Debug: log item để xem structure
    if (selectedPeriod === "weekly" || selectedPeriod === "quarterly") {
      console.log(`[${selectedPeriod}] Item:`, item);
    }

    if (selectedPeriod === "daily") {
      // Ngày: dd/mm cho label, Ngày dd/mm/yyyy cho tooltip
      const date = new Date(item.date);
      label = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
      fullLabel = `Ngày ${date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })}`;
    } else if (selectedPeriod === "weekly") {
      // Tuần: T45 - 2025 cho label, Tuần 45 - Năm 2025 cho tooltip
      // Backend trả về format: "2025-W45"
      const date = new Date(item.date);
      let year = date.getFullYear();
      let weekNum;
      
      if (item.period) {
        // Parse format "2025-W45" hoặc "W45-2025" hoặc các biến thể
        const weekMatch = item.period.match(/(\d{4})[-\s]*W(\d+)/i) || 
                         item.period.match(/W(\d+)[-\s]*(\d{4})/i);
        
        if (weekMatch) {
          if (item.period.match(/(\d{4})[-\s]*W(\d+)/i)) {
            // Format: "2025-W45"
            year = weekMatch[1];
            weekNum = weekMatch[2];
          } else {
            // Format: "W45-2025"
            weekNum = weekMatch[1];
            year = weekMatch[2];
          }
        } else {
          // Fallback: chỉ lấy số
          const numMatch = item.period.match(/(\d+)/);
          if (numMatch) {
            weekNum = numMatch[1];
          }
        }
      }
      
      // Nếu không parse được, tính ISO week number
      if (!weekNum) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      }
      
      label = `T${weekNum} - ${year}`;
      fullLabel = `Tuần ${weekNum} - Năm ${year}`;
    } else if (selectedPeriod === "monthly") {
      // Tháng: mm/yyyy cho label, Tháng xx - Năm yyyy cho tooltip
      const date = new Date(item.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      label = `${String(month).padStart(2, "0")}/${year}`;
      fullLabel = `Tháng ${month} - Năm ${year}`;
    } else if (selectedPeriod === "quarterly") {
      // Quý: Qx-yyyy cho label, Quý x - Năm yyyy cho tooltip
      if (item.period) {
        const quarterMatch = item.period.match(/[Qq]?[uý]*\s*(\d+).*?(\d{4})/);
        if (quarterMatch) {
          const quarter = quarterMatch[1];
          const year = quarterMatch[2];
          label = `Q${quarter}-${year}`;
          fullLabel = `Quý ${quarter} - Năm ${year}`;
        } else {
          label = item.period;
          fullLabel = item.period;
        }
      } else {
        // Fallback: tính từ date
        const date = new Date(item.date);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const year = date.getFullYear();
        label = `Q${quarter}-${year}`;
        fullLabel = `Quý ${quarter} - Năm ${year}`;
      }
    } else if (selectedPeriod === "yearly") {
      // Năm: yyyy
      const date = new Date(item.date);
      label = date.getFullYear().toString();
      fullLabel = `Năm ${label}`;
    } else {
      label = item.period || new Date(item.date).toLocaleDateString("vi-VN");
      fullLabel = label;
    }

    return {
      name: label,
      fullName: fullLabel,
      revenue: item.revenue,
      bookingCount: item.bookingCount || 0,
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {payload[0].payload.fullName}
          </p>
          <p className="text-sm text-gray-600">
            Doanh thu:{" "}
            <span className="font-semibold text-gray-900">
              {payload[0].value.toLocaleString("vi-VN")}đ
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {payload[0].payload.bookingCount} booking
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Doanh thu</h3>
          <p className="text-sm text-gray-500 mt-1">
            {selectedPeriod === "weekly" &&
              `Hiển thị ${weekCount} tuần gần nhất`}
            {selectedPeriod !== "weekly" && "Biểu đồ doanh thu theo thời gian"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Week Count Selector - chỉ hiện khi chọn Weekly */}
          {selectedPeriod === "weekly" && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Số tuần:</label>
              <select
                value={weekCount}
                onChange={(e) =>
                  onWeekCountChange && onWeekCountChange(Number(e.target.value))
                }
                className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value={4}>4 tuần</option>
                <option value={8}>8 tuần</option>
                <option value={12}>12 tuần</option>
              </select>
            </div>
          )}

          {/* Period Filter */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => handlePeriodChange(period.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedPeriod === period.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-sm">Chưa có dữ liệu</p>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              />
              <Bar
                dataKey="revenue"
                fill="#111827"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
