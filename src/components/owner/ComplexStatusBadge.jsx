/**
 * Badge component hiển thị trạng thái Complex
 * Pending (0) → Vàng
 * Approved (1) → Xanh
 * Rejected (2) → Đỏ
 */
export default function ComplexStatusBadge({ status }) {
  const statusConfig = {
    0: { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    1: { label: "Đã duyệt", color: "bg-green-100 text-green-800 border-green-300" },
    2: { label: "Bị từ chối", color: "bg-red-100 text-red-800 border-red-300" },
  };

  const config = statusConfig[status] || statusConfig[0];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
}
