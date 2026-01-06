/**
 * Badge component hiển thị trạng thái Booking
 * Mapping theo BookingStatus enum từ backend
 */
export default function BookingStatusBadge({ status }) {
  const statusConfig = {
    0: { label: "Chờ thanh toán cọc", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    1: { label: "Chờ duyệt", color: "bg-blue-100 text-blue-800 border-blue-300" },
    2: { label: "Đã xác nhận", color: "bg-green-100 text-green-800 border-green-300" },
    3: { label: "Đã từ chối", color: "bg-red-100 text-red-800 border-red-300" },
    4: { label: "Đã hủy", color: "bg-gray-100 text-gray-800 border-gray-300" },
    5: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    6: { label: "Hết hạn", color: "bg-orange-100 text-orange-800 border-orange-300" },
    7: { label: "Không đến", color: "bg-purple-100 text-purple-800 border-purple-300" },
  };

  const config = statusConfig[status] || statusConfig[0];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
}
